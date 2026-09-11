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

  function load() {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

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

  const active = employees.filter((e) => e.status !== "inactive");
  const filtered = active.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      (e.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Employee Directory</h1>
        <Link
          href="/hr/employees/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800"
        >
          + Add Employee
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md px-3 py-2 max-w-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="text-sm outline-none w-full"
        />
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
              className="bg-white border border-slate-200 rounded-lg p-4 relative hover:shadow-sm transition"
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
                <p className="font-medium text-slate-900">{emp.fullName}</p>
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
