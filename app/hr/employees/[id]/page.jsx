"use client";

import { useEffect, useState } from "react";
import EmployeeCard from "@/components/EmployeeCard";

export default function EmployeeDetailPage({ params }) {
  const { id } = params;
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee));

    fetch(`/api/attendance?employeeId=${id}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.records || []));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <EmployeeCard employee={employee} />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-md">
        <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm">
          Attendance History
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Check In</th>
              <th className="px-4 py-2">Check Out</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}</td>
                <td className="px-4 py-2">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}</td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
