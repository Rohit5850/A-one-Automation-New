import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import MissPunchRequest from "@/app/models/MissPunchRequest";
import Attendance from "@/app/models/Attendance";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { automaticWorkStatus, sessionMetrics } from "@/app/lib/attendanceMetrics";
import { notifyEmployee } from "@/app/lib/notificationService";
function toIndiaDate(date, hhmm) { return new Date(`${date}T${hhmm}:00+05:30`); }
function autoStatus(sessions) {
    const ms = sessionMetrics({ sessions }).workedMs;
    return automaticWorkStatus(ms, false);
}
function validateSessions(sessions) {
    const sorted = [...sessions].sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    for (const s of sorted) {
        if (!s.checkIn || !s.checkOut || new Date(s.checkOut) <= new Date(s.checkIn))
            throw new Error("Approved punch se invalid/overnight session ban raha hai");
    }
    for (let i = 1; i < sorted.length; i++)
        if (new Date(sorted[i].checkIn) < new Date(sorted[i - 1].checkOut))
            throw new Error("Approved punch existing session se overlap kar raha hai");
    return sorted;
}
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        if (!["approved", "rejected"].includes(body.status))
            return NextResponse.json({ error: "approved/rejected status required hai" }, { status: 400 });
        await dbConnect();
        const request = await MissPunchRequest.findById(id).populate("employee", "reportingHead");
        if (!request)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (request.status !== "pending")
            return NextResponse.json({ error: "Request already reviewed hai" }, { status: 400 });
        // The assigned Reporting Head (Manager or HR) is the normal approver.
        // HR may act only as a fallback when that assigned head is unavailable.
        if (request.employee?.reportingHead) {
            const head = await User.findById(request.employee.reportingHead)
                .select("isActive role employee")
                .populate("employee", "employeeType status");

            const isAssignedHead =
                String(request.employee.reportingHead) === String(session.user.id);

            const headAvailable =
                !!head?.isActive &&
                (head.role === "hr" ||
                    (head.role === "employee" &&
                        head.employee?.employeeType === "manager" &&
                        head.employee?.status !== "inactive"));

            const hrFallbackAllowed = session.user.role === "hr" && !headAvailable;

            if (!isAssignedHead && !hrFallbackAllowed) {
                return NextResponse.json(
                    { error: "Ye request assigned Reporting Head ko approve/reject karni hai" },
                    { status: 403 }
                );
            }
        } else if (session.user.role !== "hr") {
            return NextResponse.json(
                { error: "Reporting Head assigned nahi hai; HR review karega" },
                { status: 403 }
            );
        }
        if (body.status === "approved") {
            const attendance = await Attendance.findOne({ employee: request.employee._id, date: request.date });
            let sessions = attendance?.sessions?.length ? attendance.sessions.map(s => ({ checkIn: s.checkIn, checkOut: s.checkOut })) : attendance?.checkIn ? [{ checkIn: attendance.checkIn, checkOut: attendance.checkOut }] : [];
            if (request.punchType === "both")
                sessions.push({ checkIn: toIndiaDate(request.date, request.checkInTime), checkOut: toIndiaDate(request.date, request.checkOutTime) });
            else if (request.punchType === "check-in") {
                const target = sessions.find(s => !s.checkIn && s.checkOut) || sessions.find(s => s.checkOut && !s.checkIn);
                if (target)
                    target.checkIn = toIndiaDate(request.date, request.checkInTime);
                else if (attendance?.checkOut && sessions.length === 0)
                    sessions.push({ checkIn: toIndiaDate(request.date, request.checkInTime), checkOut: attendance.checkOut });
                else
                    return NextResponse.json({ error: "Missing Check-In ko pair karne ke liye Check-Out available nahi hai. Both option use karein." }, { status: 400 });
            }
            else {
                const target = [...sessions].reverse().find(s => s.checkIn && !s.checkOut);
                if (target)
                    target.checkOut = toIndiaDate(request.date, request.checkOutTime);
                else if (attendance?.checkIn && sessions.length === 0)
                    sessions.push({ checkIn: attendance.checkIn, checkOut: toIndiaDate(request.date, request.checkOutTime) });
                else
                    return NextResponse.json({ error: "Missing Check-Out ko pair karne ke liye Check-In available nahi hai. Both option use karein." }, { status: 400 });
            }
            try {
                sessions = validateSessions(sessions);
            }
            catch (e) {
                return NextResponse.json({ error: e.message }, { status: 400 });
            }
            const update = { sessions, checkIn: sessions[0]?.checkIn || null, checkOut: sessions.at(-1)?.checkOut || null };
            if (attendance?.statusSource !== "manual") {
                update.status = autoStatus(sessions);
                update.statusSource = "auto";
                update.leaveType = null;
                update.leaveFraction = 1;
            }
            await Attendance.findOneAndUpdate({ employee: request.employee._id, date: request.date }, { $set: { employee: request.employee._id, date: request.date, ...update } }, { upsert: true, new: true, runValidators: true });
        }
        request.status = body.status;
        request.reviewNote = body.reviewNote || "";
        request.reviewedBy = session.user.id;
        await request.save();
        const statusLabel = body.status === "approved" ? "Approved" : "Rejected";
        await notifyEmployee({
            employeeId: request.employee._id,
            eventKey: `miss-punch:${request._id}:${body.status}`,
            title: `Miss Punch ${statusLabel}`,
            message: `${request.date} ki Miss Punch request ${statusLabel.toLowerCase()} ho gayi hai.${request.reviewNote ? ` Note: ${request.reviewNote}` : ""}`,
            href: "/employee/miss-punch",
        });
        return NextResponse.json({ request });
    }
    catch (err) {
        console.error("PATCH /api/miss-punch-requests/[id] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
