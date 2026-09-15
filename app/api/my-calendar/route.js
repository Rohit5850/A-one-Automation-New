import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { buildMonthCalendar } from "@/app/lib/attendanceCalendar";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    await dbConnect();
    const employee = await Employee.findById(session.user.employeeId).select("showLocationToEmployee");
    const days = await buildMonthCalendar(session.user.employeeId, month);

    const canSeeLocation = !!employee?.showLocationToEmployee;
    const safeDays = canSeeLocation
      ? days
      : days.map(({ checkInLocation, checkOutLocation, sessions, ...day }) => ({
          ...day,
          sessions: Array.isArray(sessions)
            ? sessions.map(({ checkInLocation: _in, checkOutLocation: _out, ...session }) => session)
            : [],
        }));

    return NextResponse.json({ days: safeDays, showLocationToEmployee: canSeeLocation });
  } catch (err) {
    console.error("GET /api/my-calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
