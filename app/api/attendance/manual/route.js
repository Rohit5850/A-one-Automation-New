import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";

// POST /api/attendance/manual -> HR only. Directly sets (or clears) the
// check-in/check-out time for ANY date - not just today. Creates the day's
// record if it doesn't exist yet, or corrects an existing one.
// Body: { employeeId, date: "YYYY-MM-DD", checkIn: "HH:MM" | "", checkOut: "HH:MM" | "" }
// Leaving checkIn/checkOut empty clears that field.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { employeeId, date, checkIn, checkOut, status } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 });
    }

    await dbConnect();

    const update = {
      employee: employeeId,
      date,
      checkIn: checkIn ? new Date(`${date}T${checkIn}:00`) : null,
      checkOut: checkOut ? new Date(`${date}T${checkOut}:00`) : null,
    };
    if (status) update.status = status;

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
