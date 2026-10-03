"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/components/EmployeeCard";
import { formatDateDMY, formatTime24 } from "@/app/lib/displayFormat";

function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function currentMonthKey() {
  return todayKey().slice(0, 7);
}

function formatHours(ms) {
  const totalMinutes = Math.max(0, Math.floor(Number(ms || 0) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function statusLabel(status) {
  const labels = {
    present: "Present",
    absent: "Absent",
    "half-day": "Half-Day",
    leave: "Leave",
    pending: "Pending",
    holiday: "Holiday",
    "week-off": "Week Off",
  };
  return labels[status] || status || "-";
}

function statusClass(status) {
  if (status === "present") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "absent") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "half-day") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "leave") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "holiday" || status === "week-off") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function leaveLabel(type) {
  return {
    earned: "Earned Leave",
    "comp-off": "C-Off / Comp-Off",
    unpaid: "Unpaid Leave",
    paternity: "Paternity Leave (legacy)",
  }[type] || type || "-";
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [missPunchRequests, setMissPunchRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const [meRes, calendarRes, todayRes, balanceRes, leaveRes, missPunchRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch(`/api/my-calendar?month=${currentMonthKey()}`, { cache: "no-store" }),
        fetch("/api/attendance?today=1", { cache: "no-store" }),
        fetch("/api/leave-balance", { cache: "no-store" }),
        fetch("/api/leave-requests", { cache: "no-store" }),
        fetch("/api/miss-punch-requests", { cache: "no-store" }),
      ]);

      const [me, calendarData, todayData, balanceData, leaveData, missPunchData] =
        await Promise.all([
          meRes.json().catch(() => ({})),
          calendarRes.json().catch(() => ({})),
          todayRes.json().catch(() => ({})),
          balanceRes.json().catch(() => ({})),
          leaveRes.json().catch(() => ({})),
          missPunchRes.json().catch(() => ({})),
        ]);

      if (meRes.ok) setEmployee(me.employee || null);
      if (calendarRes.ok) setCalendar(calendarData.days || []);
      if (todayRes.ok) setTodayAttendance(todayData.record || null);
      if (balanceRes.ok) setLeaveBalance(balanceData.balance || balanceData);
      if (leaveRes.ok) {
        const rows = leaveData.requests || [];
        const ownRows = rows.filter((row) => {
          const id = row.employee?._id || row.employee;
          return !id || String(id) === String(me.employee?._id || me.employee?.id || "");
        });
        setLeaveRequests(ownRows);
      }
      if (missPunchRes.ok) {
        const rows = missPunchData.requests || [];
        const ownRows = rows.filter((row) => {
          const id = row.employee?._id || row.employee;
          return !id || String(id) === String(me.employee?._id || me.employee?.id || "");
        });
        setMissPunchRequests(ownRows);
      }

      const failed = [
        [meRes, "profile"],
        [calendarRes, "attendance"],
        [todayRes, "today attendance"],
        [balanceRes, "leave balance"],
        [leaveRes, "leave requests"],
        [missPunchRes, "miss punch"],
      ].filter(([response]) => !response.ok);

      if (failed.length) {
        setMessage(`Some dashboard data could not load: ${failed.map(([, label]) => label).join(", ")}.`);
      }
    } catch (error) {
      console.error("Employee dashboard load failed:", error);
      setMessage("Dashboard data load nahi ho paya. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const today = todayKey();
  const calendarToday = calendar.find((day) => day.date === today);
  const todayRecord = todayAttendance || calendarToday || null;

  const monthStats = calendar.reduce(
    (stats, day) => {
      if (day.status === "present") stats.present += 1;
      else if (day.status === "half-day") {
        stats.halfDay += 1;
        if (day.leaveType) stats.leave += Math.min(0.5, Number(day.leaveFraction || 0.5));
      }
      else if (day.status === "absent") stats.absent += 1;
      else if (day.status === "leave") stats.leave += Number(day.leaveFraction || 1);
      else if (day.status === "holiday") stats.holiday += 1;
      else if (day.status === "week-off") stats.weekOff += 1;
      return stats;
    },
    { present: 0, halfDay: 0, absent: 0, leave: 0, holiday: 0, weekOff: 0 }
  );

  const pendingLeave = leaveRequests.filter((request) => request.status === "pending");
  const pendingMissPunch = missPunchRequests.filter((request) => request.status === "pending");
  const recentLeave = leaveRequests.slice(0, 5);
  const recentMissPunch = missPunchRequests.slice(0, 5);

  const earnedAvailable = Number(leaveBalance?.earned?.available || 0);
  const compOffAvailable = Number(leaveBalance?.compOff?.available || 0);

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Home</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Welcome{employee ? `, ${employee.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            HR ke attendance, leave aur miss-punch updates yahan live database se dikhte hain.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      )}

      <EmployeeCard employee={employee} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Present this month" value={monthStats.present} />
        <SummaryCard label="Half-Day this month" value={monthStats.halfDay} />
        <SummaryCard label="Absent this month" value={monthStats.absent} />
        <SummaryCard label="Leave this month" value={monthStats.leave} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Today Attendance</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{formatDateDMY(today)}</h2>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(todayRecord?.status)}`}>
            {statusLabel(todayRecord?.status)}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Info label="Check-In" value={todayRecord?.checkIn ? formatTime24(todayRecord.checkIn) : "-"} />
          <Info label="Check-Out" value={todayRecord?.checkOut ? formatTime24(todayRecord.checkOut) : "-"} />
          <Info label="Worked" value={formatHours(todayRecord?.workedMs)} />
        </div>

        {Array.isArray(todayRecord?.sessions) && todayRecord.sessions.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Today Sessions</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {todayRecord.sessions.map((session, index) => (
                <div key={`${session.checkIn || index}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="font-semibold">Session {index + 1}:</span>{" "}
                  {session.checkIn ? formatTime24(session.checkIn) : "-"} →{" "}
                  {session.checkOut ? formatTime24(session.checkOut) : "Active"}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Leave Balance</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">Available Leave</h2>
            </div>
            <Link href="/employee/leave" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View Leave
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="Earned Leave" value={`${earnedAvailable} days`} />
            <Info label="C-Off" value={`${compOffAvailable} days`} />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Pending leave requests: <strong className="text-slate-700">{pendingLeave.length}</strong>
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Miss Punch</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">Request Status</h2>
            </div>
            <Link href="/employee/miss-punch" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View Requests
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="Pending" value={pendingMissPunch.length} />
            <Info label="Total Requests" value={missPunchRequests.length} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentTable
          title="Recent Leave Requests"
          empty="No leave requests."
          rows={recentLeave.map((request) => ({
            id: request._id,
            first: leaveLabel(request.leaveType),
            second: `${formatDateDMY(request.fromDate)} - ${formatDateDMY(request.toDate)}`,
            status: request.status,
          }))}
        />

        <RecentTable
          title="Recent Miss Punch Requests"
          empty="No miss punch requests."
          rows={recentMissPunch.map((request) => ({
            id: request._id,
            first: formatDateDMY(request.date),
            second: request.punchType || "-",
            status: request.status,
          }))}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/employee/attendance"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Go to Attendance
        </Link>
        <Link
          href="/employee/miss-punch"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Miss Punch Request
        </Link>
        <Link
          href="/employee/leave"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Apply / View Leave
        </Link>
        <Link
          href="/employee/salary"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Salary & Payroll
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function RecentTable({ title, rows, empty }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{row.first}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{row.second}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(row.status)}`}>
                {statusLabel(row.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
