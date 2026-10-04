import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import LeaveRequest from "@/app/models/LeaveRequest";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { dateKeyFromDate } from "@/app/lib/payrollRules";
import { computeLeaveBalance, countLeaveWorkingDays } from "@/app/lib/leaveBalance";
import { notifyEmployee } from "@/app/lib/notificationService";
function* dateRange(fromDate, toDate) { let d = new Date(`${fromDate}T00:00:00Z`), e = new Date(`${toDate}T00:00:00Z`); while (d <= e) {
    yield d.toISOString().slice(0, 10);
    d = new Date(d.getTime() + 86400000);
} }
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { status, reviewNote } = body;
        if (!["approved", "rejected"].includes(status))
            return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
        await dbConnect();
        const request = await LeaveRequest.findById(id).populate("employee", "reportingHead dateOfJoining dateOfLeaving");
        if (!request)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (request.status !== "pending")
            return NextResponse.json({ error: "Ye leave request already review ho chuki hai" }, { status: 400 });
        if (request.employee?.reportingHead) {
            const head = await User.findById(request.employee.reportingHead).select("isActive role employee").populate("employee", "employeeType status");
            const assigned = String(request.employee.reportingHead) === String(session.user.id);
            const headAvailable = !!head?.isActive && (head.role === "hr" || (head.role === "employee" && head.employee?.employeeType === "manager" && head.employee?.status !== "inactive"));
            const fallback = session.user.role === "hr" && !headAvailable;
            if (!assigned && !fallback)
                return NextResponse.json({ error: "Ye request assigned Reporting Head ko approve/reject karni hai" }, { status: 403 });
        }
        else if (session.user.role !== "hr")
            return NextResponse.json({ error: "Reporting Head assigned nahi hai; HR review karega" }, { status: 403 });
        if (status === "approved" && request.leaveType !== "unpaid") {
            const balance = await computeLeaveBalance(request.employee._id);
            const working = await countLeaveWorkingDays(request.employee._id, request.fromDate, request.toDate);
            const needed = Number(request.leaveFraction || 1) === 0.5 ? 0.5 : working;
            const key = request.leaveType === "comp-off" ? "compOff" : "earned";
            const available = Number(balance[key]?.available || 0);
            if (needed > available)
                return NextResponse.json({ error: `${request.leaveType === "comp-off" ? "C-Off" : "Earned Leave"} balance sirf ${available} day available hai` }, { status: 400 });
        }
        request.status = status;
        request.reviewNote = reviewNote || "";
        request.reviewedBy = session.user.id;
        await request.save();
        if (status === "approved") {
            const join = dateKeyFromDate(request.employee?.dateOfJoining), leaving = dateKeyFromDate(request.employee?.dateOfLeaving);
            const fraction = Number(request.leaveFraction || 1);
            for (const date of dateRange(request.fromDate, request.toDate)) {
                if ((join && date < join) || (leaving && date > leaving))
                    continue;
                const isSunday = new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
                const holiday = await Holiday.findOne({ date });
                if (isSunday || holiday)
                    continue;
                const existing = await Attendance.findOne({ employee: request.employee._id, date });
                const hasPunch = !!existing?.checkIn || (Array.isArray(existing?.sessions) && existing.sessions.some(s => s?.checkIn));
                // Full-day approved leave never overwrites worked attendance. Half-day leave
                // may coexist with punches; status stays half-day while leave metadata records
                // the approved half and its paid/unpaid type.
                if (fraction === 1 && hasPunch)
                    continue;
                const set = { employee: request.employee._id, date, leaveType: request.leaveType, leaveFraction: fraction, reason: `${request.leaveType === "comp-off" ? "C-OFF" : request.leaveType + " leave"}${fraction === 0.5 ? ` (${request.halfDayPart === "first-half" ? "First Half" : "Second Half"})` : ""}${request.note ? ` - ${request.note}` : ""}`, statusSource: "manual" };
                if (fraction === 0.5 && hasPunch)
                    set.status = "half-day";
                else
                    set.status = "leave";
                await Attendance.findOneAndUpdate({ employee: request.employee._id, date }, { $set: set }, { upsert: true, new: true, runValidators: true });
            }
        }
        const leaveLabel = request.leaveType === "comp-off" ? "C-Off" : request.leaveType === "unpaid" ? "Unpaid Leave" : "Earned Leave";
        const statusLabel = status === "approved" ? "Approved" : "Rejected";
        await notifyEmployee({
            employeeId: request.employee._id,
            eventKey: `leave:${request._id}:${status}`,
            title: `Leave ${statusLabel}`,
            message: `${leaveLabel} request ${request.fromDate}${request.toDate !== request.fromDate ? ` to ${request.toDate}` : ""} ${statusLabel.toLowerCase()} ho gayi hai.${request.reviewNote ? ` Note: ${request.reviewNote}` : ""}`,
            href: "/employee/leave",
        });
        return NextResponse.json({ request });
    }
    catch (err) {
        console.error("PATCH /api/leave-requests/[id] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
