"use client";

import { useEffect, useState } from "react";
import { formatDateDMY } from "@/app/lib/displayFormat";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="">
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-slate-500 text-sm">Koi user nahi mila.</p>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Linked Employee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-slate-100/80">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 uppercase text-xs font-medium">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.employee ? `${u.employee.fullName} (${u.employee.employeeId})` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateDMY(u.createdAt)}
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
