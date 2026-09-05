"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default function AllEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">All Employees</h1>
        <Link href="/hr/attendance" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to Mark Attendance
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-slate-500 text-sm">Koi employee nahi mila.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{emp.fullName}</p>
                    <p className="text-xs text-slate-500">{emp.employeeId}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      emp.status === "inactive"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="text-sm space-y-1 text-slate-700">
                  <p>
                    <span className="text-slate-400">Email: </span>
                    {emp.email || "-"}
                  </p>
                  <p>
                    <span className="text-slate-400">Mobile: </span>
                    {emp.phone || "-"}
                  </p>
                  <p>
                    <span className="text-slate-400">Gender: </span>
                    <span className="capitalize">{emp.gender || "-"}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Joining Date: </span>
                    {formatDate(emp.dateOfJoining)}
                  </p>
                  <p>
                    <span className="text-slate-400">Leaving Date: </span>
                    {formatDate(emp.dateOfLeaving)}
                  </p>
                </div>

                <Link
                  href={`/hr/employees/${emp._id}`}
                  className="text-sm text-slate-900 underline inline-block pt-1"
                >
                  View Attendance History
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
