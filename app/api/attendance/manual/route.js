import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";

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
    const { employeeId, date, checkIn, checkOut, status, reason } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 });
    }

    await dbConnect();

    const update = { employee: employeeId, date };
    const hasManualTimes = "checkIn" in body || "checkOut" in body;
    const manualIn = checkIn ? new Date(`${date}T${checkIn}:00`) : null;
    const manualOut = checkOut ? new Date(`${date}T${checkOut}:00`) : null;

    if ("checkIn" in body) update.checkIn = manualIn;
    if ("checkOut" in body) update.checkOut = manualOut;
    // Manual time edit is treated as a full-day override. Keep one clean session
    // so effective hours and break calculations stay consistent.
    if (hasManualTimes) {
      update.sessions = manualIn ? [{ checkIn: manualIn, checkOut: manualOut }] : [];
    }
    if (status) update.status = status;
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
