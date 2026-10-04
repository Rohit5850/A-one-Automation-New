"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";
import { formatDateDMY, formatTime24 } from "@/app/lib/displayFormat";
function indiaDateKey(value = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
}
function fmtMs(ms) { if (!ms || ms <= 0)
    return "-"; const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return `${h}h ${m}m`; }
function statusLabel(r) {
    if (r?.status === "leave") {
        if (r.leaveType === "earned")
            return "Paid Leave · Earned Leave";
        if (r.leaveType === "comp-off")
            return `Paid Leave · C-Off ${Number(r.leaveFraction) === 0.5 ? "Half-Day" : "Full-Day"}`;
        return "Unpaid Leave";
    }
    if (r?.status === "half-day") {
        if (r.leaveType === "earned") return "Half-Day · Earned Leave";
        if (r.leaveType === "comp-off") return "Half-Day · C-Off";
        if (r.leaveType === "unpaid") return "Half-Day · Unpaid Leave";
        return "Half-Day";
    }
    if (r?.status === "pending")
        return "Pending";
    return r?.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "-";
}
function timeValue(v) { return v ? formatTime24(v) : ""; }

function locationAddress(location) {
    if (!location) return "";
    const values = [
        location.landmark,
        location.placeName,
        location.area,
        location.city,
        location.district,
        location.state,
        location.postcode ? `PIN ${location.postcode}` : "",
        location.country,
    ].filter((value) => typeof value === "string" && value.trim());

    const unique = [];
    const seen = new Set();
    for (const value of values) {
        const key = value.trim().toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(value.trim());
        }
    }

    if (unique.length) return unique.join(", ");
    if (location.displayName) return location.displayName;
    if (Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
        return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }
    return "Location captured, address unavailable";
}

function mapsUrl(location) {
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(`${location.lat},${location.lng}`)}`;
}

function LocationDetails({ location, label }) {
    if (!location) return null;
    const url = mapsUrl(location);
    return <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2">
        <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
            {url && <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">Google Maps ↗</a>}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-700">{locationAddress(location)}</p>
        {Number.isFinite(location.lat) && Number.isFinite(location.lng) && <p className="mt-1 text-[10px] text-slate-400">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}{Number.isFinite(location.accuracy) ? ` · ±${Math.round(location.accuracy)}m` : ""}</p>}
    </div>;
}

function AttendanceLocations({ record }) {
    const punchLocations = [];
    const sessionList = Array.isArray(record?.sessions) ? record.sessions : [];

    sessionList.forEach((session, index) => {
        if (session?.checkInLocation) {
            punchLocations.push({
                key: `in-${index}`,
                label: `Check-In ${session.checkIn ? formatTime24(session.checkIn) : ""}`.trim(),
                location: session.checkInLocation,
            });
        }
        if (session?.checkOutLocation) {
            punchLocations.push({
                key: `out-${index}`,
                label: `Check-Out ${session.checkOut ? formatTime24(session.checkOut) : ""}`.trim(),
                location: session.checkOutLocation,
            });
        }
    });

    // Legacy attendance records may have day-level location without session-level location.
    if (!punchLocations.length) {
        if (record?.checkInLocation) punchLocations.push({ key: "day-in", label: `Check-In ${record.checkIn ? formatTime24(record.checkIn) : ""}`.trim(), location: record.checkInLocation });
        if (record?.checkOutLocation) punchLocations.push({ key: "day-out", label: `Check-Out ${record.checkOut ? formatTime24(record.checkOut) : ""}`.trim(), location: record.checkOutLocation });
    }

    if (!punchLocations.length) return <span className="text-slate-400">Location not captured</span>;
    return <div className="min-w-[290px] space-y-2">{punchLocations.map((item) => <LocationDetails key={item.key} label={item.label} location={item.location}/>)}</div>;
}
export default function HRAttendancePage() {
    const [employees, setEmployees] = useState([]), [query, setQuery] = useState(""), [employee, setEmployee] = useState(null), [records, setRecords] = useState([]);
    const [date, setDate] = useState(indiaDateKey()), [sessions, setSessions] = useState([{ checkIn: "", checkOut: "" }]), [timeMsg, setTimeMsg] = useState(""), [savingTime, setSavingTime] = useState(false);
    const [statusDate, setStatusDate] = useState(indiaDateKey()), [status, setStatus] = useState("present"), [paidType, setPaidType] = useState("earned-full"), [reason, setReason] = useState(""), [statusMsg, setStatusMsg] = useState(""), [savingStatus, setSavingStatus] = useState(false);
    const today = indiaDateKey();
    useEffect(() => { fetch("/api/employees").then(r => r.json()).then(d => setEmployees((d.employees || []).filter(e => e.status === "active"))).catch(() => setEmployees([])); }, []);
    const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return !q ? employees : employees.filter(e => (e.fullName || "").toLowerCase().includes(q) || (e.employeeId || "").toLowerCase().includes(q)); }, [employees, query]);
    function load(id) { fetch(`/api/attendance?employeeId=${id}`, { cache: "no-store" }).then(r => r.json()).then(d => setRecords(d.records || [])); }
    function choose(emp) { setEmployee(emp); setDate(today); setStatusDate(today); setTimeMsg(""); setStatusMsg(""); load(emp._id); }
    useEffect(() => {
        if (!employee?._id) return;
        const timer = setInterval(() => load(employee._id), 5000);
        return () => clearInterval(timer);
    }, [employee?._id]);
    useEffect(() => { const r = records.find(x => x.date === date); const list = (r?.sessions || []).map(x => ({ checkIn: timeValue(x.checkIn), checkOut: timeValue(x.checkOut) })); setSessions(list.length ? list : [{ checkIn: "", checkOut: "" }]); }, [date, records]);
    async function saveTime() {
        if (!employee)
            return;
        if (!sessions.length || sessions.some(x => !x.checkIn || !x.checkOut)) {
            setTimeMsg("Har Session ka Check-In aur Check-Out required hai.");
            return;
        }
        setSavingTime(true);
        setTimeMsg("");
        const res = await fetch("/api/attendance/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId: employee._id, date, sessions }) });
        const d = await res.json().catch(() => ({}));
        setSavingTime(false);
        if (res.ok) {
            setTimeMsg("Attendance time save ho gaya.");
            load(employee._id);
        }
        else
            setTimeMsg(d.error || "Attendance time save nahi hua.");
    }
    async function saveStatus() {
        if (!employee)
            return;
        let payload = { status, leaveType: null, leaveFraction: 1 };
        if (status === "paid-leave") {
            if (paidType.startsWith("earned")) payload = { status: "leave", leaveType: "earned", leaveFraction: paidType === "earned-half" ? 0.5 : 1 };
            else payload = { status: "leave", leaveType: "comp-off", leaveFraction: paidType === "comp-off-half" ? 0.5 : 1 };
        }
        if (status === "unpaid-leave")
            payload = { status: "leave", leaveType: "unpaid", leaveFraction: 1 };
        setSavingStatus(true);
        setStatusMsg("");
        const res = await fetch("/api/attendance/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId: employee._id, date: statusDate, ...payload, reason }) });
        const d = await res.json().catch(() => ({}));
        setSavingStatus(false);
        if (res.ok) {
            setStatusMsg("Attendance status save ho gaya.");
            setReason("");
            load(employee._id);
        }
        else
            setStatusMsg(d.error || "Status save nahi hua.");
    }
    return <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    <div className="flex items-end justify-between gap-4 flex-wrap"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Attendance Control</p><h1 className="text-2xl font-bold text-slate-900 mt-1">Mark Attendance</h1><p className="text-sm text-slate-500 mt-1">Employee time aur daily attendance status ko ek clean HR view se manage karein.</p></div><Link href="/hr/employees/all" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm">All Employees</Link></div>

    {!employee ? <div className="space-y-4"><div className="bg-white/90 border border-white rounded-2xl shadow-sm p-4"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by Employee Name / EMP-ID" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map(emp => <button key={emp._id} onClick={() => choose(emp)} className="text-left bg-white/90 border border-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">{(emp.fullName || "E").split(" ").map(n => n[0]).join("").slice(0, 2)}</div><div className="min-w-0"><p className="font-semibold text-slate-900 truncate">{emp.fullName}</p><p className="text-xs text-slate-500">{emp.employeeId}</p></div></div></button>)}{!filtered.length && <p className="text-sm text-slate-400">No employee found.</p>}</div></div> : <>
      <button onClick={() => setEmployee(null)} className="text-sm font-medium text-indigo-600">← Select another employee</button><EmployeeCard employee={employee}/>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-white/90 border border-white rounded-2xl shadow-sm p-5"><div className="mb-5"><p className="font-bold text-slate-900">Manual Sessions</p><p className="text-xs text-slate-500 mt-1">Same day multiple Session 1/2/3 add/edit karein. Overlap aur overnight allowed nahi hai.</p></div><label className="text-xs font-medium text-slate-600">Date<input type="date" max={today} value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label><div className="mt-3 space-y-2">{sessions.map((x, i) => <div key={i} className="grid grid-cols-[70px_1fr_1fr_auto] gap-2 items-end"><span className="text-xs font-semibold text-slate-600 pb-3">Session {i + 1}</span><label className="text-xs">Check-In<input type="time" value={x.checkIn} onChange={e => setSessions(a => a.map((v, j) => j === i ? { ...v, checkIn: e.target.value } : v))} className="w-full border rounded-lg px-2 py-2 mt-1"/></label><label className="text-xs">Check-Out<input type="time" value={x.checkOut} onChange={e => setSessions(a => a.map((v, j) => j === i ? { ...v, checkOut: e.target.value } : v))} className="w-full border rounded-lg px-2 py-2 mt-1"/></label><button type="button" disabled={sessions.length === 1} onClick={() => setSessions(a => a.filter((_, j) => j !== i))} className="mb-1 text-red-600 text-xs">Remove</button></div>)}</div><button type="button" onClick={() => setSessions(a => [...a, { checkIn: "", checkOut: "" }])} className="mt-3 text-indigo-600 text-xs font-semibold">+ Add Session</button>{timeMsg && <p className={`text-xs mt-3 ${timeMsg.includes("save ho gaya") ? "text-emerald-600" : "text-red-600"}`}>{timeMsg}</p>}<button onClick={saveTime} disabled={savingTime} className="mt-4 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{savingTime ? "Saving..." : "Save Sessions"}</button></section>

        <section className="bg-white/90 border border-white rounded-2xl shadow-sm p-5"><div className="mb-5"><p className="font-bold text-slate-900">Mark Attendance Status</p><p className="text-xs text-slate-500 mt-1">Only Present, Absent, Half-Day, Unpaid Leave and Paid Leave.</p></div><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-600">Date<input type="date" max={today} value={statusDate} onChange={e => setStatusDate(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label><label className="text-xs font-medium text-slate-600">Status<select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"><option value="present">Present</option><option value="absent">Absent</option><option value="half-day">Half-Day</option><option value="unpaid-leave">Unpaid Leave</option><option value="paid-leave">Paid Leave</option></select></label></div>{status === "paid-leave" && <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3"><label className="text-xs font-semibold text-indigo-800">Paid Leave Type<select value={paidType} onChange={e => setPaidType(e.target.value)} className="mt-1 w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm text-slate-800"><option value="earned-full">Earned Leave (Full-Day)</option><option value="earned-half">Earned Leave (Half-Day)</option><option value="comp-off-half">C-OFF (Half-Day)</option><option value="comp-off-full">C-OFF (Full-Day)</option></select></label></div>}<label className="block mt-3 text-xs font-medium text-slate-600">Reason / Note<input value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional note" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label>{statusMsg && <p className={`text-xs mt-3 ${statusMsg.includes("save ho gaya") ? "text-emerald-600" : "text-red-600"}`}>{statusMsg}</p>}<button onClick={saveStatus} disabled={savingStatus} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{savingStatus ? "Saving..." : "Save Status"}</button></section>
      </div>
      <section className="bg-white/90 border border-white rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><p className="font-bold text-slate-900">Attendance History</p><p className="text-xs text-slate-500 mt-1">Employee web punches automatically sync here. Check-In/Check-Out GPS is shown as resolved landmark/city/state/PIN with a direct Google Maps link. Normal office day is 09:00–18:00 (9h); work above 9h is shown as Extra Work only.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[1420px] text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Sessions</th><th className="text-left px-4 py-3">Check-In</th><th className="text-left px-4 py-3">Check-Out</th><th className="text-left px-4 py-3">Location</th><th className="text-left px-4 py-3">Worked</th><th className="text-left px-4 py-3">Extra Work</th><th className="text-left px-4 py-3">Break</th><th className="text-left px-4 py-3">Late</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Reason</th></tr></thead><tbody>{records.map(r => <tr key={r._id} className="border-t border-slate-100 align-top"><td className="px-4 py-3">{formatDateDMY(r.date)}</td><td className="px-4 py-3 text-xs">{(r.sessions || []).length ? (r.sessions || []).map((x, i) => <div key={i}><b>Session {i + 1}:</b> {formatTime24(x.checkIn)}–{x.checkOut ? formatTime24(x.checkOut) : "Working"}</div>) : "-"}</td><td className="px-4 py-3 font-medium">{r.checkIn ? formatTime24(r.checkIn) : "-"}</td><td className="px-4 py-3 font-medium">{r.checkOut ? formatTime24(r.checkOut) : (r.checkIn ? "Working" : "-")}</td><td className="px-4 py-3"><AttendanceLocations record={r}/></td><td className="px-4 py-3">{fmtMs(r.workedMs)}</td><td className="px-4 py-3 font-semibold text-violet-700">{fmtMs(r.extraWorkMs)}</td><td className="px-4 py-3">{fmtMs(r.breakMs)}</td><td className="px-4 py-3">{r.lateArrival ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${r.latePenaltyHalfDay ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>Late #{r.lateArrivalNumber || "-"}{r.latePenaltyHalfDay ? " · Half-Day" : ""}</span> : "-"}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{statusLabel(r)}</span></td><td className="px-4 py-3 text-slate-500">{r.reason || "-"}</td></tr>)}{!records.length && <tr><td colSpan="11" className="px-4 py-8 text-center text-slate-400">No attendance history.</td></tr>}</tbody></table></div></section>
    </>}
  </div>;
}
