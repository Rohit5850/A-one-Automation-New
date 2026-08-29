"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function HRDashboard() {
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
        <h1 className="font-semibold text-slate-900">HR Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/hr/employees/new"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800"
          >
            + Add Employee
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="text-slate-500 text-sm">Abhi tak koi employee add nahi hua.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{emp.employeeId}</td>
                    <td className="px-4 py-3">{emp.fullName}</td>
                    <td className="px-4 py-3">{emp.department || "-"}</td>
                    <td className="px-4 py-3">{emp.designation || "-"}</td>
                    <td className="px-4 py-3 capitalize">{emp.status}</td>
                    <td className="px-4 py-3">
                      <Link href={`/hr/employees/${emp._id}`} className="text-slate-900 underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
