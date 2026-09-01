"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import EmployeeCard from "@/app/Components/EmployeeCard";

const CURRENT_YEAR = new Date().getFullYear();
// Shows the current year plus the previous 4 -> 5 years of selectable history
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function formatDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const ms = new Date(checkOut) - new Date(checkIn);
  if (ms <= 0) return "-";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// Read-only: attendance is now marked by HR from /hr/attendance.
// Employee can only view their own profile and history here.
export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [year, setYear] = useState(CURRENT_YEAR);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee));
  }, []);

  useEffect(() => {
    fetch(`/api/attendance?year=${year}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.records || []));
  }, [year]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">My Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <EmployeeCard employee={employee} />

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm flex items-center justify-between">
            <span>My Attendance History</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-sm border border-slate-300 rounded-md px-2 py-1"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Check-in Time</th>
                <th className="px-4 py-2">Check-out Time</th>
                <th className="px-4 py-2">Total Time</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {year} ke liye koi record nahi mila.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2">{formatDuration(r.checkIn, r.checkOut)}</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
