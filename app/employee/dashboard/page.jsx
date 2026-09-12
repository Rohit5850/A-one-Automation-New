"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee))
      .catch((err) => console.error("Failed to load profile:", err));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Home</p>
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome{employee ? `, ${employee.fullName.split(" ")[0]}` : ""}
      </h1>

      <EmployeeCard employee={employee} />

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/employee/attendance"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Go to Attendance
        </Link>
        <Link
          href="/employee/leave"
          className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
        >
          Apply / View Leave
        </Link>
      </div>
    </div>
  );
}
