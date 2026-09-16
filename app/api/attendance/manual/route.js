import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Employee from "@/app/models/Employee";
import Holiday from "@/app/models/Holiday";
import { dateKeyFromDate, todayDateKey } from "@/app/lib/payrollRules";
import { computeLeaveBalance } from "@/app/lib/leaveBalance";

// POST /api/attendance/manual -> HR only. Directly sets (or clears) the
// check-in/check-out time for ANY date - not just today. Also used to mark
// leave, half-day, holiday, or week-off with a reason.
// Body: { employeeId, date, checkIn?, checkOut?, status?, reason? }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { employeeId, date, checkIn, checkOut, status, reason, leaveType } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (date > todayDateKey()) {
      return NextResponse.json({ error: "Future date par attendance mark nahi kar sakte" }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findById(employeeId).select("dateOfJoining dateOfLeaving status");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    const joinDate = dateKeyFromDate(employee.dateOfJoining);
    const leaveDate = dateKeyFromDate(employee.dateOfLeaving);
    if (joinDate && date < joinDate) {
      return NextResponse.json({ error: "Joining date se pehle attendance mark nahi kar sakte" }, { status: 400 });
    }
    if (leaveDate && date > leaveDate) {
      return NextResponse.json({ error: "Leaving date ke baad attendance mark nahi kar sakte" }, { status: 400 });
    }

    const currentRecord = await Attendance.findOne({ employee: employeeId, date });
    if (status && ["leave", "absent", "half-day"].includes(status)) {
      const isSunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
      const holiday = await Holiday.findOne({ date }).select("name");
      if (isSunday || holiday) {
        return NextResponse.json(
          { error: isSunday ? "Sunday automatic Week Off hai; is date par leave/absent mark nahi hoga" : `${holiday.name} automatic paid Holiday hai; is date par leave/absent mark nahi hoga` },
          { status: 400 }
        );
      }
    }
    const update = { employee: employeeId, date };
    const hasManualTimes = "checkIn" in body || "checkOut" in body;
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (checkIn && !hhmm.test(checkIn)) {
      return NextResponse.json({ error: "Check-in time HH:MM 24-hour format me hona chahiye" }, { status: 400 });
    }
    if (checkOut && !hhmm.test(checkOut)) {
      return NextResponse.json({ error: "Check-out time HH:MM 24-hour format me hona chahiye" }, { status: 400 });
    }
    // Earlier/equal checkout clock time means next-day checkout.
    // Example: 14:30 -> 00:00 = 9h 30m.
    const isOvernight = !!(checkIn && checkOut && checkOut <= checkIn);
    if (status && !["present", "half-day", "leave", "absent", "holiday", "week-off"].includes(status)) {
      return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 });
    }
    if (status === "leave" && !["earned", "paternity", "comp-off", "unpaid"].includes(leaveType)) {
      return NextResponse.json({ error: "Leave type select karna zaroori hai" }, { status: 400 });
    }

    // Paid/C-Off leave can only be manually assigned when the employee has balance.
    // If this date is already the same leave type, add that one day back while validating
    // so editing the reason does not fail its own balance check.
    if (status === "leave" && leaveType !== "unpaid") {
      const balance = await computeLeaveBalance(employeeId);
      const key = leaveType === "comp-off" ? "compOff" : leaveType;
      let available = Number(balance?.[key]?.available || 0);
      if (currentRecord?.status === "leave" && currentRecord?.leaveType === leaveType) available += 1;
      if (available < 1) {
        const label = leaveType === "comp-off" ? "C-Off" : leaveType === "earned" ? "Paid/Earned Leave" : "Paternity Leave";
        return NextResponse.json({ error: `${label} balance available nahi hai` }, { status: 400 });
      }
    }

    // Parse manual HH:MM explicitly as India local time. This keeps HR-entered
    // attendance stable even if the server itself runs in UTC.
    const manualIn = checkIn ? new Date(`${date}T${checkIn}:00+05:30`) : null;
    let manualOut = checkOut ? new Date(`${date}T${checkOut}:00+05:30`) : null;
    if (manualOut && isOvernight) {
      manualOut = new Date(manualOut.getTime() + 24 * 60 * 60 * 1000);
    }

    if (manualIn && manualOut) {
      const durationMs = manualOut.getTime() - manualIn.getTime();
      if (durationMs <= 0 || durationMs > 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: "Manual shift 24 hours se zyada nahi ho sakti" },
          { status: 400 }
        );
      }
    }

    if ("checkIn" in body) update.checkIn = manualIn;
    if ("checkOut" in body) update.checkOut = manualOut;
    // Manual time edit is treated as a full-day override. Keep one clean session
    // so effective hours and break calculations stay consistent.
    if (hasManualTimes) {
      update.sessions = manualIn ? [{ checkIn: manualIn, checkOut: manualOut }] : [];
    }
    if (status) {
      update.status = status;
      update.leaveType = status === "leave" ? leaveType : null;

      // Leave/Absent are full-day manual overrides; stale punches must not remain
      // attached to a non-working status. Half-day may legitimately retain punches.
      if (!hasManualTimes && (status === "leave" || status === "absent")) {
        update.checkIn = null;
        update.checkOut = null;
        update.checkInLocation = null;
        update.checkOutLocation = null;
        update.sessions = [];
      }
    } else if (hasManualTimes && manualIn) {
      // Entering actual work time means the day is worked unless HR explicitly
      // submitted another status in the same request.
      update.status = "present";
      update.leaveType = null;
      update.reason = "";
    }
    if ("reason" in body) update.reason = reason || "";

    // $set is critical here - without it, findOneAndUpdate would REPLACE the
    // whole document and wipe out fields not included above.
    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance/manual error:", err);
    return NextResponse.json({ error: "Could not save manual entry" }, { status: 500 });
  }
}
