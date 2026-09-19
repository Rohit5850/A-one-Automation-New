import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import LeaveRequest from "@/app/models/LeaveRequest";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { computeLeaveBalance, countLeaveWorkingDays } from "@/app/lib/leaveBalance";
import { todayDateKey } from "@/app/lib/payrollRules";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const filter = {};
    if (session.user.role === "employee") filter.employee = session.user.employeeId;
    else if (session.user.role === "hr") {
      const employeeId = searchParams.get("employeeId"), status = searchParams.get("status");
      if (employeeId) filter.employee = employeeId;
      if (status) filter.status = status;
    } else return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const requests = await LeaveRequest.find(filter).populate("employee", "fullName employeeId reportingHead").sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/leave-requests error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const { fromDate, toDate, leaveType, note, halfDayPart } = body;
    const leaveFraction = Number(body.leaveFraction || 1);
    if (!fromDate || !toDate || !leaveType) return NextResponse.json({ error: "fromDate, toDate and leaveType are required" }, { status: 400 });
    if (!["earned", "comp-off", "unpaid"].includes(leaveType)) return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
    if (![0.5,1].includes(leaveFraction)) return NextResponse.json({ error: "Full-day ya Half-day select karein" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate) || toDate < fromDate) return NextResponse.json({ error: "Invalid leave date range" }, { status: 400 });
    if (toDate < todayDateKey()) return NextResponse.json({ error: "Past date ke liye nayi leave request submit nahi kar sakte" }, { status: 400 });
    if (leaveFraction === 0.5) {
      if (fromDate !== toDate) return NextResponse.json({ error: "Half-day leave ek single date ke liye apply hoti hai" }, { status: 400 });
      if (!["first-half", "second-half"].includes(halfDayPart)) return NextResponse.json({ error: "First Half ya Second Half select karein" }, { status: 400 });
    }
    const workingDays = await countLeaveWorkingDays(session.user.employeeId, fromDate, toDate);
    if (workingDays <= 0) return NextResponse.json({ error: "Selected range me koi working day nahi hai" }, { status: 400 });
    const requestedDays = leaveFraction === 0.5 ? 0.5 : workingDays;
    if (leaveType !== "unpaid") {
      const balance = await computeLeaveBalance(session.user.employeeId);
      const available = Number(balance[leaveType === "comp-off" ? "compOff" : "earned"]?.available || 0);
      if (requestedDays > available) return NextResponse.json({ error: `Sirf ${available} din available hain is leave type me` }, { status: 400 });
    }
    await dbConnect();
    const overlapping = await LeaveRequest.findOne({ employee: session.user.employeeId, status: { $in: ["pending", "approved"] }, fromDate: { $lte: toDate }, toDate: { $gte: fromDate } });
    if (overlapping) return NextResponse.json({ error: "Is date range me pehle se pending/approved leave request hai" }, { status: 400 });
    const request = await LeaveRequest.create({ employee: session.user.employeeId, fromDate, toDate, leaveType, leaveFraction, halfDayPart: leaveFraction === 0.5 ? halfDayPart : null, note });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("POST /api/leave-requests error:", err);
    return NextResponse.json({ error: "Could not submit leave request" }, { status: 500 });
  }
}
