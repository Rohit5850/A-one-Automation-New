"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HRDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard-summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch((err) => console.error("Failed to load summary:", err));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Summary</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="font-medium text-slate-900 mb-3">Who is on leave today</p>
          {!summary ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (summary.onLeaveToday ?? []).length === 0 ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-md px-3 py-2">
              No employee is on leave today.
            </div>
          ) : (
            <ul className="space-y-2">
              {summary.onLeaveToday.map((p) => (
                <li key={p.id} className="text-sm text-slate-700">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="font-medium text-slate-900 mb-3">Not checked in yet today</p>
          {!summary ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (summary.notCheckedIn ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Everyone has checked in.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {summary.notCheckedIn.map((p) => (
                <div key={p.id} className="flex flex-col items-center gap-1 w-16">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <p className="text-[11px] text-slate-600 text-center truncate w-full">
                    {p.name.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={summary?.totalEmployees ?? "-"}
          accent="border-l-slate-800"
        />
        <StatCard
          label="Present today"
          value={summary?.presentCount ?? "-"}
          accent="border-l-emerald-500"
        />
        <StatCard
          label="Not checked in"
          value={summary?.notCheckedIn.length ?? "-"}
          accent="border-l-rose-500"
        />
        <StatCard
          label="On leave today"
          value={summary?.onLeaveToday.length ?? "-"}
          accent="border-l-amber-500"
        />
      </div>

      {summary?.isHolidayToday && (
        <div className="bg-purple-50 border border-purple-100 text-purple-800 text-sm rounded-md px-4 py-3">
          Today is a holiday: {summary.holidayName}
        </div>
      )}
      {summary?.isWeekOffToday && !summary?.isHolidayToday && (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-md px-4 py-3">
          Today is the weekly off (Sunday).
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/hr/attendance"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Mark Attendance
        </Link>
        <Link
          href="/hr/employees/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800"
        >
          + Add Employee
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${accent} rounded-lg p-4`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
