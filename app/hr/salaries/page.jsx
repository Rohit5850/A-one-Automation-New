"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function currentMonthStr() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}`;
}

function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export default function SalariesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(currentMonthStr());
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

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

  async function downloadSalarySlip(emp) {
    setDownloadingId(emp._id);
    setDownloadError("");
    try {
      const res = await fetch(`/api/payroll/${emp._id}?month=${month}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.employee || !data?.payroll) {
        throw new Error(data?.error || "Payroll data load nahi ho payi.");
      }
      const { generateSalarySlipPdf } = await import("@/app/lib/salarySlip");
      await generateSalarySlipPdf(data.employee, data.payroll, month);
    } catch (err) {
      console.error("Salary slip download failed:", err);
      setDownloadError(err?.message || "Salary slip download nahi ho payi.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="">
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-slate-900">Salaries</h1>
      </div>

      <main className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Salary Slip Month</p>
            <p className="text-xs text-slate-500">Selected month ki slip har employee ke saamne download kar sakte hain.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="w-8 h-8 rounded-xl border border-slate-200/90 bg-white/85 shadow-sm bg-white hover:bg-slate-50 text-slate-600"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-slate-800 w-40 text-center">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="w-8 h-8 rounded-xl border border-slate-200/90 bg-white/85 shadow-sm bg-white hover:bg-slate-50 text-slate-600"
            >
              ›
            </button>
          </div>
        </div>

        {downloadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {downloadError}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-left">
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
                  <tr key={emp._id} className="border-t border-slate-100/80">
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
                          className="border border-slate-200/90 bg-white/85 rounded-xl shadow-sm px-2 py-1 text-sm w-28"
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
                          <button
                            onClick={() => downloadSalarySlip(emp)}
                            disabled={downloadingId === emp._id}
                            className="text-[#5b4ff0] text-xs font-semibold hover:underline disabled:opacity-50 whitespace-nowrap"
                          >
                            {downloadingId === emp._id ? "Preparing..." : "Download Slip"}
                          </button>
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
