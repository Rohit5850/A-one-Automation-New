import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import LeaveRequest from "@/app/models/LeaveRequest";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";

function* dateRange(fromDate, toDate) {
  let d = new Date(fromDate);
  const end = new Date(toDate);
  while (d <= end) {
    yield d.toISOString().slice(0, 10);
    d = new Date(d.getTime() + 86400000);
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, reviewNote } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    await dbConnect();
    const request = await LeaveRequest.findByIdAndUpdate(
      id,
      { $set: { status, reviewNote, reviewedBy: session.user.id } },
      { new: true }
    );
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (status === "approved") {
      // Mark each day in the range as "leave", skipping days that are already
      // a paid holiday or the weekly-off (Sunday) - those don't need a leave entry.
      for (const date of dateRange(request.fromDate, request.toDate)) {
        const isSunday = new Date(date).getDay() === 0;
        const holiday = await Holiday.findOne({ date });
        if (isSunday || holiday) continue;

        await Attendance.findOneAndUpdate(
          { employee: request.employee, date },
          {
            $set: {
              employee: request.employee,
              date,
              status: "leave",
              reason: `${request.leaveType} leave${request.note ? ` - ${request.note}` : ""}`,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ request });
  } catch (err) {
    console.error("PATCH /api/leave-requests/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
