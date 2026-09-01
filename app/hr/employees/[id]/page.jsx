"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function formatDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const ms = new Date(checkOut) - new Date(checkIn);
  if (ms <= 0) return "-";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// Read-only view. Corrections to a wrong check-in/check-out are made from the
// "Mark Attendance" page's Reset button, not from here.
export default function EmployeeDetailPage({ params }) {
  const { id } = use(params); // Next.js 15+/16: page params are async
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [year, setYear] = useState(CURRENT_YEAR);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee))
      .catch((err) => console.error("Failed to load employee:", err));
  }, [id]);

  useEffect(() => {
    fetch(`/api/attendance?employeeId=${id}&year=${year}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.records || []))
      .catch((err) => console.error("Failed to load attendance:", err));
  }, [id, year]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to Dashboard
      </Link>

      <EmployeeCard employee={employee} />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-3xl">
        <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm flex items-center justify-between">
          <span>Attendance History</span>
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
              <th className="px-4 py-2">Check In</th>
              <th className="px-4 py-2">Check Out</th>
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
                <td className="px-4 py-2">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}</td>
                <td className="px-4 py-2">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}</td>
                <td className="px-4 py-2">{formatDuration(r.checkIn, r.checkOut)}</td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
