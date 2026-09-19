import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import OvertimeEntry from "@/app/models/OvertimeEntry";
import Employee from "@/app/models/Employee";
import Holiday from "@/app/models/Holiday";
import Attendance from "@/app/models/Attendance";
import { salaryRateForMonth, todayDateKey, roundMoney } from "@/app/lib/payrollRules";
import { compOffCreditForWorkedMs, sessionMetrics } from "@/app/lib/attendanceMetrics";

function daysInMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function autoHourlyRate(employee, date) {
  const month = date.slice(0, 7);
  const rate = salaryRateForMonth(employee, month);
  const daily = rate.wageType === "monthly" ? Number(rate.amount || 0) / daysInMonth(month) : Number(rate.amount || 0);
  return roundMoney(daily / 9); // normal 09:00-18:00 = 9 hours
}
async function isOffDay(date) {
  const sunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
  if (sunday) return { off: true, reason: "Week Off" };
  const holiday = await Holiday.findOne({ date }).select("name");
  return holiday ? { off: true, reason: holiday.name || "Holiday" } : { off: false, reason: "" };
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || todayDateKey().slice(0, 7);
    let filter = { date: { $gte: `${month}-01`, $lte: `${month}-31` } };
    if (session.user.role === "employee") {
      filter.employee = session.user.employeeId;
    } else if (session.user.role === "hr") {
      const employeeId = searchParams.get("employeeId");
      if (employeeId) filter.employee = employeeId;
    } else return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const entries = await OvertimeEntry.find(filter)
      .populate("employee", "fullName employeeId department")
      .sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("GET /api/overtime error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const { employeeId, date, settlement, note } = body;
    const hours = Number(body.hours);
    const requestedRate = body.ratePerHour === "" || body.ratePerHour == null ? null : Number(body.ratePerHour);


    if (!employeeId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return NextResponse.json({ error: "Employee aur valid date required hai" }, { status: 400 });
    if (date > todayDateKey()) return NextResponse.json({ error: "Future date par overtime add nahi kar sakte" }, { status: 400 });
    if (!["pay", "comp-off"].includes(settlement)) return NextResponse.json({ error: "Pay ya C-Off select karein" }, { status: 400 });

    await dbConnect();
    const employee = await Employee.findById(employeeId).select("+salary +salaryHistory +overtimeRatePerHour dateOfJoining dateOfLeaving status wageType");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const join = employee.dateOfJoining?.toISOString().slice(0, 10);
    const leave = employee.dateOfLeaving?.toISOString().slice(0, 10);
    if (join && date < join) return NextResponse.json({ error: "Joining date se pehle overtime add nahi ho sakta" }, { status: 400 });
    if (leave && date > leave) return NextResponse.json({ error: "Leaving date ke baad overtime add nahi ho sakta" }, { status: 400 });

    const offDay = await isOffDay(date);
    if (settlement === "comp-off" && !offDay.off) {
      return NextResponse.json({ error: "C-Off sirf Holiday ya Week Off par kiye gaye work ke liye credit ho sakta hai" }, { status: 400 });
    }
    let offDayAttendance = null;
    if (offDay.off) offDayAttendance = await Attendance.findOne({ employee: employeeId, date });
    if (settlement === "comp-off" && !offDayAttendance) {
      return NextResponse.json({ error: "C-Off credit ke liye Holiday/Week Off date ka attendance required hai" }, { status: 400 });
    }
    if (offDay.off) {
      const existingSettlement = await OvertimeEntry.findOne({ employee: employeeId, date });
      if (existingSettlement) return NextResponse.json({ error: "Is Holiday/Week Off date ka OT/C-Off settlement already decide ho chuka hai. Change ke liye existing entry delete karein." }, { status: 400 });
    }

    let ratePerHour = 0, amount = 0, creditedDays = 0, settledHours = hours;
    if (settlement === "pay") {
      if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return NextResponse.json({ error: "Overtime hours 0 se zyada aur 24 se kam/equal hone chahiye" }, { status: 400 });
      const autoRate = Number(employee.overtimeRatePerHour || 0) > 0 ? Number(employee.overtimeRatePerHour) : autoHourlyRate(employee, date);
      ratePerHour = requestedRate != null ? requestedRate : autoRate;
      if (!Number.isFinite(ratePerHour) || ratePerHour < 0) return NextResponse.json({ error: "Valid overtime rate required hai" }, { status: 400 });
      amount = roundMoney(hours * ratePerHour);
    } else {
      const metrics = sessionMetrics(offDayAttendance.toObject());
      settledHours = Math.round((metrics.workedMs / 3600000) * 100) / 100;
      creditedDays = compOffCreditForWorkedMs(metrics.workedMs);
      if (!creditedDays) return NextResponse.json({ error: "C-Off ke liye minimum 4.5 worked hours required hain" }, { status: 400 });
      // 4.5h to <9h = 0.5 C-Off; >=9h = 1 C-Off. Maximum one credit/day.
      // Credit is derived from attendance, never manually typed.
    }

    const entry = await OvertimeEntry.create({
      employee: employeeId, date, hours: settledHours, settlement, ratePerHour, amount,
      compOffDays: creditedDays, note: note || "", createdBy: session.user.id,
    });
    return NextResponse.json({ entry, offDay }, { status: 201 });
  } catch (err) {
    console.error("POST /api/overtime error:", err);
    return NextResponse.json({ error: "Overtime save nahi ho paya" }, { status: 500 });
  }
}
