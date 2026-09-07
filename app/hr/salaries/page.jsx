"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SalariesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/salaries")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(emp) {
    setEditingId(emp._id);
    setEditValue(emp.salary ?? "");
  }

  async function saveEdit(emp) {
    setSaving(true);
    await fetch(`/api/employees/${emp._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salary: editValue }),
    });
    setSaving(false);
    setEditingId(null);
    load();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">Salaries</h1>
        <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Wage Type</th>
                  <th className="px-4 py-3">Salary / Rate</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Koi employee nahi mila.
                    </td>
                  </tr>
                )}
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-xs text-slate-500">{emp.employeeId}</p>
                    </td>
                    <td className="px-4 py-3">{emp.department || "-"}</td>
                    <td className="px-4 py-3 capitalize">{emp.wageType || "-"}</td>
                    <td className="px-4 py-3">
                      {editingId === emp._id ? (
                        <input
                          type="number"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border border-slate-300 rounded-md px-2 py-1 text-sm w-28"
                        />
                      ) : (
                        `₹${emp.salary ?? "-"}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === emp._id ? (
                        <div className="flex gap-3">
                          <button
                            disabled={saving}
                            onClick={() => saveEdit(emp)}
                            className="text-emerald-700 text-xs font-medium hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(emp)}
                            className="text-slate-700 text-xs font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/hr/employees/${emp._id}`}
                            className="text-slate-700 text-xs font-medium hover:underline"
                          >
                            View Payroll
                          </Link>
                        </div>
                      )}
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
