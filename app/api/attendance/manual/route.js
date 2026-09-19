import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Employee from "@/app/models/Employee";
import Holiday from "@/app/models/Holiday";
import { dateKeyFromDate, todayDateKey } from "@/app/lib/payrollRules";
import { computeLeaveBalance } from "@/app/lib/leaveBalance";
import { sessionMetrics } from "@/app/lib/attendanceMetrics";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUS_OPTIONS = new Set(["present", "half-day", "leave", "absent"]);
const LEAVE_OPTIONS = new Set(["earned", "comp-off", "unpaid"]);

function toIndiaDate(date, hhmm) { return new Date(`${date}T${hhmm}:00+05:30`); }
function parseSessions(date, input) {
  if (!Array.isArray(input)) throw new Error("Sessions list required hai");
  const parsed = input.map((s, index) => {
    if (!HHMM.test(s?.checkIn || "") || !HHMM.test(s?.checkOut || "")) throw new Error(`Session ${index + 1}: valid Check-In aur Check-Out required hai`);
    if (s.checkOut <= s.checkIn) throw new Error(`Session ${index + 1}: Check-Out, Check-In se greater hona chahiye. Overnight shift allowed nahi hai.`);
    return { checkIn: toIndiaDate(date, s.checkIn), checkOut: toIndiaDate(date, s.checkOut) };
  }).sort((a,b)=>a.checkIn-b.checkIn);
  for (let i=1;i<parsed.length;i++) if (parsed[i].checkIn < parsed[i-1].checkOut) throw new Error(`Session ${i + 1} previous session se overlap kar raha hai`);
  return parsed;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const { employeeId, date, status, reason, leaveType } = body;
    if (!employeeId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return NextResponse.json({ error: "Employee aur valid date required hai" }, { status: 400 });
    if (date > todayDateKey()) return NextResponse.json({ error: "Future date par attendance mark nahi kar sakte" }, { status: 400 });

    await dbConnect();
    const employee = await Employee.findById(employeeId).select("dateOfJoining dateOfLeaving status");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    const join = dateKeyFromDate(employee.dateOfJoining), leaving = dateKeyFromDate(employee.dateOfLeaving);
    if (join && date < join) return NextResponse.json({ error: "Joining date se pehle attendance mark nahi kar sakte" }, { status: 400 });
    if (leaving && date > leaving) return NextResponse.json({ error: "Leaving date ke baad attendance mark nahi kar sakte" }, { status: 400 });

    const existing = await Attendance.findOne({ employee: employeeId, date });
    const update = { employee: employeeId, date };

    if ("checkIn" in body || "checkOut" in body) {
      if (!HHMM.test(body.checkIn || "") || !HHMM.test(body.checkOut || "")) {
        return NextResponse.json({ error: "Valid Check-In aur Check-Out required hai" }, { status: 400 });
      }
      if (body.checkOut <= body.checkIn) {
        return NextResponse.json({ error: "Check-Out, Check-In se greater hona chahiye. Overnight shift allowed nahi hai." }, { status: 400 });
      }
      const single = [{ checkIn: toIndiaDate(date, body.checkIn), checkOut: toIndiaDate(date, body.checkOut) }];
      update.sessions = single; // internal compatibility; UI exposes only daily Check-In/Check-Out
      update.checkIn = single[0].checkIn;
      update.checkOut = single[0].checkOut;
      update.checkInLocation = null;
      update.checkOutLocation = null;
      if (!status) {
        const metrics = sessionMetrics({ sessions: single });
        update.status = metrics.workedMs < 4.5*3600000 ? "absent" : metrics.workedMs === 4.5*3600000 ? "half-day" : "present";
        update.statusSource = "auto";
        update.leaveType = null;
        update.leaveFraction = 1;
        update.reason = "";
      }
    }

    if ("sessions" in body) {
      let sessions;
      try { sessions = parseSessions(date, body.sessions); } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
      update.sessions = sessions;
      update.checkIn = sessions[0]?.checkIn || null;
      update.checkOut = sessions.at(-1)?.checkOut || null;
      update.checkInLocation = null;
      update.checkOutLocation = null;
      if (!status) {
        const metrics = sessionMetrics({ sessions });
        update.status = metrics.workedMs < 4.5*3600000 ? "absent" : metrics.workedMs === 4.5*3600000 ? "half-day" : "present";
        update.statusSource = "auto";
        update.leaveType = null;
        update.leaveFraction = 1;
        update.reason = "";
      }
    }

    if (status) {
      if (!STATUS_OPTIONS.has(status)) return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 });
      update.status = status;
      update.statusSource = "manual";
      update.reason = reason || "";
      if (status === "leave") {
        if (!LEAVE_OPTIONS.has(leaveType)) return NextResponse.json({ error: "Valid leave type select karein" }, { status: 400 });
        const fraction = leaveType === "comp-off" ? Number(body.leaveFraction) : 1;
        if (leaveType === "comp-off" && ![0.5,1].includes(fraction)) return NextResponse.json({ error: "C-Off Half-day ya Full-day select karein" }, { status: 400 });
        update.leaveType = leaveType; update.leaveFraction = fraction;
        if (leaveType !== "unpaid") {
          const balance = await computeLeaveBalance(employeeId);
          const key = leaveType === "comp-off" ? "compOff" : "earned";
          let available = Number(balance?.[key]?.available || 0);
          if (existing?.status === "leave" && existing?.leaveType === leaveType) available += Number(existing.leaveFraction || 1);
          if (available < fraction) return NextResponse.json({ error: `${leaveType === "comp-off" ? "C-Off" : "Earned Leave"} balance available nahi hai` }, { status: 400 });
        }
      } else { update.leaveType = null; update.leaveFraction = 1; }
      if (["leave","absent"].includes(status) && !("sessions" in body)) {
        update.sessions=[]; update.checkIn=null; update.checkOut=null; update.checkInLocation=null; update.checkOutLocation=null;
      }
    }

    if (!status && !("sessions" in body) && !("checkIn" in body) && !("checkOut" in body)) return NextResponse.json({ error: "Status ya attendance time required hai" }, { status: 400 });
    const record = await Attendance.findOneAndUpdate({ employee: employeeId, date }, { $set: update }, { upsert:true,new:true,runValidators:true });
    return NextResponse.json({ record, metrics: sessionMetrics(record.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance/manual error:", err);
    return NextResponse.json({ error: "Could not save manual attendance" }, { status: 500 });
  }
}
