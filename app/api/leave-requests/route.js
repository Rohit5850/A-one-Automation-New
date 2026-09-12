import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import LeaveRequest from "@/app/models/LeaveRequest";
import { computeLeaveBalance } from "@/app/lib/leaveBalance";

function daysInclusive(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return Math.round((to - from) / 86400000) + 1;
}

// GET /api/leave-requests
//   - employee: own requests only
//   - hr: all requests, optional ?employeeId= and ?status= filters
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    let filter = {};

    if (session.user.role === "employee") {
      filter.employee = session.user.employeeId;
    } else if (session.user.role === "hr") {
      const employeeId = searchParams.get("employeeId");
      const status = searchParams.get("status");
      if (employeeId) filter.employee = employeeId;
      if (status) filter.status = status;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requests = await LeaveRequest.find(filter)
      .populate("employee", "fullName employeeId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/leave-requests error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/leave-requests -> employee applies for leave (self only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { fromDate, toDate, leaveType, note } = body;

    if (!fromDate || !toDate || !leaveType) {
      return NextResponse.json(
        { error: "fromDate, toDate and leaveType are required" },
        { status: 400 }
      );
    }
    if (!["earned", "paternity", "unpaid"].includes(leaveType)) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
    }
    if (new Date(toDate) < new Date(fromDate)) {
      return NextResponse.json({ error: "To date must be after From date" }, { status: 400 });
    }

    // Soft balance check (informational, doesn't block unpaid leave)
    if (leaveType !== "unpaid") {
      const balance = await computeLeaveBalance(session.user.employeeId);
      const requestedDays = daysInclusive(fromDate, toDate);
      const available = balance[leaveType].available;
      if (requestedDays > available) {
        return NextResponse.json(
          { error: `Sirf ${available} din available hain is leave type me` },
          { status: 400 }
        );
      }
    }

    await dbConnect();
    const request = await LeaveRequest.create({
      employee: session.user.employeeId,
      fromDate,
      toDate,
      leaveType,
      note,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("POST /api/leave-requests error:", err);
    return NextResponse.json({ error: "Could not submit leave request" }, { status: 500 });
  }
}
