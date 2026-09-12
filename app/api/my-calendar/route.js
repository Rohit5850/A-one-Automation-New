import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { buildMonthCalendar } from "@/app/lib/attendanceCalendar";

// GET /api/my-calendar?month=YYYY-MM -> employee's own day-by-day attendance,
// including automatic holiday/week-off detection for days with no record yet.
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const days = await buildMonthCalendar(session.user.employeeId, month);
    return NextResponse.json({ days });
  } catch (err) {
    console.error("GET /api/my-calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
