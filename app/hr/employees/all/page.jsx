"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
];

function colorFor(id) {
  let sum = 0;
  for (const ch of id || "") sum += ch.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}

function initials(name) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AllEmployeesInner() {
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [department, setDepartment] = useState("");

  function load() {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleWebAttendance(emp) {
    const nextValue = !emp.webAttendanceEnabled;
    const res = await fetch(`/api/employees/${emp._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ webAttendanceEnabled: nextValue, fieldWorker: nextValue }) });
    if (res.ok) setEmployees((list) => list.map((x) => x._id === emp._id ? { ...x, webAttendanceEnabled: nextValue, fieldWorker: nextValue } : x));
    else alert("Web Check In/Out update nahi ho paya.");
  }

  async function toggleEmployeeLocation(emp) {
    const nextValue = !emp.showLocationToEmployee;
    setEmployees((current) =>
      current.map((item) =>
        item._id === emp._id ? { ...item, showLocationToEmployee: nextValue } : item
      )
    );

    const res = await fetch(`/api/employees/${emp._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showLocationToEmployee: nextValue }),
    });

    if (!res.ok) {
      setEmployees((current) =>
        current.map((item) =>
          item._id === emp._id ? { ...item, showLocationToEmployee: !nextValue } : item
        )
      );
      alert("Location visibility update nahi ho payi. Dubara try karein.");
    }
  }


  async function unlockEmployee(emp) {
    if (!confirm(`${emp.fullName} ki ID unlock karke password Aone@123 reset karein?`)) return;
    const res = await fetch(`/api/employees/${emp._id}/unlock`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || "ID unlock nahi ho payi.");
    alert(`${emp.fullName} ki ID unlock ho gayi. Password Aone@123 reset hua hai. Next login par password change required hoga.`);
  }

  async function handleDelete(emp) {
    setOpenMenuId(null);
    if (
      !confirm(
        `${emp.fullName} ko list se hatayein? Attendance/salary history hamesha database me safe rahegi.`
      )
    )
      return;
    const res = await fetch(`/api/employees/${emp._id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Delete nahi ho paya.");
  }

  const active = employees;
  const filtered = active.filter((e) => {
    const q = query.trim().toLowerCase();
    if (department && e.department !== department) return false;
    if (!q) return true;
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      false
    );
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Employee Directory</h1>
        <Link
          href="/hr/employees/new"
          className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/15 text-sm px-4 py-2 rounded-md hover:bg-slate-800"
        >
          + Add Employee
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md px-3 py-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name / EMP-ID"
          className="text-sm outline-none w-full"
        />
      </div>
      <select value={department} onChange={(e)=>setDepartment(e.target.value)} className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm"><option value="">All Departments</option>{["Automation","Sales","Electrical","HR"].map((d)=><option key={d}>{d}</option>)}</select>
      </div>

      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {active.length}
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp._id}
              className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_16px_42px_-28px_rgba(15,23,42,0.32)] p-4 relative hover:shadow-sm transition"
            >
              <button
                onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-lg leading-none"
              >
                ⋯
              </button>

              {openMenuId === emp._id && (
                <div className="absolute top-10 right-3 bg-white border border-slate-200 rounded-md shadow-md text-sm z-10 w-32 overflow-hidden">
                  <Link
                    href={`/hr/employees/${emp._id}`}
                    className="block px-3 py-2 hover:bg-slate-50"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/hr/employees/${emp._id}/edit`}
                    className="block px-3 py-2 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              <Link href={`/hr/employees/${emp._id}`} className="block">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg mb-3 ${colorFor(
                    emp._id
                  )}`}
                >
                  {initials(emp.fullName)}
                </div>
                <div className="flex items-center gap-2 pr-7"><p className="font-medium text-slate-900">{emp.fullName}</p><span className={`text-[10px] font-bold ${emp.status === "inactive" ? "text-red-600" : "text-emerald-600"}`}>{emp.status === "inactive" ? "INACTIVE" : "ACTIVE"}</span></div>
                <p className="text-sm text-slate-500 mb-3">{emp.designation || "-"}</p>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Department :{" "}
                    <span className="text-slate-700 font-medium">{emp.department || "-"}</span>
                  </p>
                  <p>
                    Wage Type :{" "}
                    <span className="text-slate-700 font-medium capitalize">
                      {emp.wageType || "-"}
                    </span>
                  </p>
                  <p className="truncate">
                    Email : <span className="text-slate-700">{emp.email}</span>
                  </p>
                </div>
              </Link>

              <div className="mt-4 pt-3 border-t border-slate-100/80">
                <button type="button" onClick={() => unlockEmployee(emp)} className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">ID Unlock / Reset Password</button>
                <p className="mt-1 text-[10px] text-slate-400">Resets to Aone@123 and forces password change on next login.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-3"><div><p className="text-xs font-medium text-slate-700">Web Check In/Out</p><p className="text-[11px] text-slate-400">Web attendance + GPS requirement</p></div><button type="button" onClick={()=>toggleWebAttendance(emp)} role="switch" aria-checked={!!emp.webAttendanceEnabled} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${emp.webAttendanceEnabled ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${emp.webAttendanceEnabled ? "translate-x-5" : "translate-x-0.5"}`}/></button></div>
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-700">Employee Location View</p>
                  <p className="text-[11px] text-slate-400">Attendance history location</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmployeeLocation(emp)}
                  role="switch"
                  aria-checked={!!emp.showLocationToEmployee}
                  title={emp.showLocationToEmployee ? "Employee location dekh sakta hai" : "Employee location nahi dekh sakta"}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                    emp.showLocationToEmployee ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      emp.showLocationToEmployee ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 col-span-full">Koi employee nahi mila.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AllEmployeesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
      <AllEmployeesInner />
    </Suspense>
  );
}
