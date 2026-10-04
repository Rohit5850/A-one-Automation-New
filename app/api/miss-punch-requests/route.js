import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import MissPunchRequest from "@/app/models/MissPunchRequest";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { todayDateKey } from "@/app/lib/payrollRules";
import { notifyAssignedReviewer } from "@/app/lib/notificationService";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const filter = {};
        if (session.user.role === "employee") {
            const me = await Employee.findById(session.user.employeeId).select("employeeType");
            if (me?.employeeType === "manager") {
                const reports = await Employee.find({ reportingHead: session.user.id }).select("_id");
                filter.$or = [{ employee: session.user.employeeId }, { employee: { $in: reports.map(x => x._id) } }];
            }
            else
                filter.employee = session.user.employeeId;
        }
        else if (session.user.role === "hr") {
            const status = searchParams.get("status");
            if (status && ["pending", "approved", "rejected"].includes(status))
                filter.status = status;
        }
        else
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const requests = await MissPunchRequest.find(filter).populate("employee", "fullName employeeId reportingHead").sort({ createdAt: -1 });
        const payload = requests.map((r) => { const o = r.toObject(); o.canReview = r.status === "pending" && String(r.employee?.reportingHead || "") === String(session.user.id); o.isOwn = String(r.employee?._id || r.employee || "") === String(session.user.employeeId || ""); return o; });
        return NextResponse.json({ requests: payload });
    }
    catch (err) {
        console.error("GET /api/miss-punch-requests error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "employee")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const body = await req.json().catch(() => ({}));
        const { date, punchType, checkInTime, checkOutTime, note } = body;
        if (!DATE_RE.test(date || "") || date > todayDateKey())
            return NextResponse.json({ error: "Valid past/today date required hai" }, { status: 400 });
        if (!["check-in", "check-out", "both"].includes(punchType))
            return NextResponse.json({ error: "Miss Punch type select karein" }, { status: 400 });
        if ((punchType === "check-in" || punchType === "both") && !TIME_RE.test(checkInTime || ""))
            return NextResponse.json({ error: "Valid Check-In time required hai" }, { status: 400 });
        if ((punchType === "check-out" || punchType === "both") && !TIME_RE.test(checkOutTime || ""))
            return NextResponse.json({ error: "Valid Check-Out time required hai" }, { status: 400 });
        if (punchType === "both" && checkOutTime <= checkInTime)
            return NextResponse.json({ error: "Check-Out, Check-In se greater hona chahiye. Overnight shift allowed nahi hai." }, { status: 400 });
        await dbConnect();
        const duplicate = await MissPunchRequest.findOne({ employee: session.user.employeeId, date, status: "pending" });
        if (duplicate)
            return NextResponse.json({ error: "Is date ki Miss Punch request already pending hai" }, { status: 400 });
        const employee = await Employee.findById(session.user.employeeId).select("reportingHead");
        if (!employee)
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        const request = await MissPunchRequest.create({ employee: session.user.employeeId, date, punchType, checkInTime: punchType === "check-out" ? null : checkInTime, checkOutTime: punchType === "check-in" ? null : checkOutTime, note });
        const punchLabel = punchType === "both" ? "Check-In + Check-Out" : punchType === "check-in" ? "Check-In" : "Check-Out";
        await notifyAssignedReviewer({
            employeeId: session.user.employeeId,
            eventKey: `miss-punch-submitted:${request._id}`,
            title: "New Miss Punch Request",
            message: `${date} ke liye ${punchLabel} correction request approval ke liye submit hui hai.`,
            hrHref: "/hr/miss-punch-requests",
            managerHref: "/employee/miss-punch",
        });
        return NextResponse.json({ request }, { status: 201 });
    }
    catch (err) {
        console.error("POST /api/miss-punch-requests error:", err);
        return NextResponse.json({ error: "Could not submit Miss Punch request" }, { status: 500 });
    }
}
