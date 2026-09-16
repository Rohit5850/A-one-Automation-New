import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import LeaveRequest from "@/app/models/LeaveRequest";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";
import Employee from "@/app/models/Employee";
import { dateKeyFromDate } from "@/app/lib/payrollRules";
import { computeLeaveBalance, countLeaveWorkingDays } from "@/app/lib/leaveBalance";

function* dateRange(fromDate, toDate) {
  let d = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
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
    const request = await LeaveRequest.findById(id);
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.status !== "pending") {
      return NextResponse.json({ error: "Ye leave request already review ho chuki hai" }, { status: 400 });
    }

    if (status === "approved" && request.leaveType !== "unpaid") {
      const balance = await computeLeaveBalance(request.employee);
      const needed = await countLeaveWorkingDays(request.employee, request.fromDate, request.toDate);
      const balanceKey = request.leaveType === "comp-off" ? "compOff" : request.leaveType;
      const available = Number(balance?.[balanceKey]?.available || 0);
      if (needed > available) {
        const label = request.leaveType === "comp-off" ? "C-Off" : request.leaveType === "earned" ? "Paid/Earned Leave" : "Paternity Leave";
        return NextResponse.json({ error: `${label} balance sirf ${available} day available hai` }, { status: 400 });
      }
    }

    request.status = status;
    request.reviewNote = reviewNote;
    request.reviewedBy = session.user.id;
    await request.save();

    if (status === "approved") {
      const employee = await Employee.findById(request.employee).select("dateOfJoining dateOfLeaving");
      const joinDate = dateKeyFromDate(employee?.dateOfJoining);
      const leaveDate = dateKeyFromDate(employee?.dateOfLeaving);

      // Mark only genuine working days inside the employee's employment period.
      // Sunday and configured holidays remain paid Week Off/Holiday, not leave.
      for (const date of dateRange(request.fromDate, request.toDate)) {
        if (joinDate && date < joinDate) continue;
        if (leaveDate && date > leaveDate) continue;

        const isSunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
        const holiday = await Holiday.findOne({ date });
        if (isSunday || holiday) continue;

        const existing = await Attendance.findOne({ employee: request.employee, date });
        const hasPunch =
          !!existing?.checkIn ||
          (Array.isArray(existing?.sessions) && existing.sessions.some((s) => s?.checkIn));
        if (hasPunch || existing?.status === "present" || existing?.status === "half-day") continue;

        await Attendance.findOneAndUpdate(
          { employee: request.employee, date },
          {
            $set: {
              employee: request.employee,
              date,
              status: "leave",
              leaveType: request.leaveType,
              reason: request.leaveType === "comp-off" ? `C-OFF${request.note ? ` - ${request.note}` : ""}` : `${request.leaveType} leave${request.note ? ` - ${request.note}` : ""}`,
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
