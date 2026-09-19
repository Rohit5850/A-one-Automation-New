import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import MissPunchRequest from "@/app/models/MissPunchRequest";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { todayDateKey } from "@/app/lib/payrollRules";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const filter = {};
    if (session.user.role === "employee") filter.employee = session.user.employeeId;
    else if (session.user.role === "hr") {
      const status = searchParams.get("status");
      if (status && ["pending", "approved", "rejected"].includes(status)) filter.status = status;
    } else return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const requests = await MissPunchRequest.find(filter).populate("employee", "fullName employeeId reportingHead").sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/miss-punch-requests error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const { date, punchType, checkInTime, checkOutTime, note } = body;
    if (!DATE_RE.test(date || "") || date > todayDateKey()) return NextResponse.json({ error: "Valid past/today date required hai" }, { status: 400 });
    if (!["check-in", "check-out", "both"].includes(punchType)) return NextResponse.json({ error: "Miss Punch type select karein" }, { status: 400 });
    if ((punchType === "check-in" || punchType === "both") && !TIME_RE.test(checkInTime || "")) return NextResponse.json({ error: "Valid Check-In time required hai" }, { status: 400 });
    if ((punchType === "check-out" || punchType === "both") && !TIME_RE.test(checkOutTime || "")) return NextResponse.json({ error: "Valid Check-Out time required hai" }, { status: 400 });
    if (punchType === "both" && checkOutTime <= checkInTime) return NextResponse.json({ error: "Check-Out, Check-In se greater hona chahiye. Overnight shift allowed nahi hai." }, { status: 400 });
    await dbConnect();
    const duplicate = await MissPunchRequest.findOne({ employee: session.user.employeeId, date, status: "pending" });
    if (duplicate) return NextResponse.json({ error: "Is date ki Miss Punch request already pending hai" }, { status: 400 });
    const employee = await Employee.findById(session.user.employeeId).select("reportingHead");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    const request = await MissPunchRequest.create({ employee: session.user.employeeId, date, punchType, checkInTime: punchType === "check-out" ? null : checkInTime, checkOutTime: punchType === "check-in" ? null : checkOutTime, note });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("POST /api/miss-punch-requests error:", err);
    return NextResponse.json({ error: "Could not submit Miss Punch request" }, { status: 500 });
  }
}
