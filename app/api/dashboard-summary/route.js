import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/dashboard-summary -> HR only. Today's snapshot across all active employees.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const today = todayStr();
    const isSunday = new Date().getDay() === 0;
    const holiday = await Holiday.findOne({ date: today });

    const employees = await Employee.find({ status: "active" }).select("fullName employeeId");
    const records = await Attendance.find({ date: today });
    const recordByEmployee = new Map(records.map((r) => [r.employee.toString(), r]));

    const onLeaveToday = [];
    const notCheckedIn = [];
    let presentCount = 0;

    for (const emp of employees) {
      const rec = recordByEmployee.get(emp._id.toString());

      if (holiday || isSunday) {
        presentCount++; // paid day off, not "absent"
        continue;
      }
      if (rec?.status === "leave") {
        onLeaveToday.push({ id: emp._id, name: emp.fullName });
        continue;
      }
      if (rec?.checkIn) {
        presentCount++;
      } else {
        notCheckedIn.push({ id: emp._id, name: emp.fullName });
      }
    }

    return NextResponse.json({
      date: today,
      isHolidayToday: !!holiday,
      holidayName: holiday?.name || null,
      isWeekOffToday: isSunday,
      totalEmployees: employees.length,
      presentCount,
      onLeaveToday,
      notCheckedIn,
    });
  } catch (err) {
    console.error("GET /api/dashboard-summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
