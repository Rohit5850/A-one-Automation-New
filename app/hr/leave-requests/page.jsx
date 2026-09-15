"use client";

import { useEffect, useState } from "react";
import { formatDateDMY } from "@/app/lib/displayFormat";

const LEAVE_TYPE_LABELS = {
  earned: "Earned Leave",
  paternity: "Paternity Leave",
  "comp-off": "C-Off / Comp-Off",
  unpaid: "Unpaid Leave",
};

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/leave-requests${q}`)
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleReview(req, status) {
    setBusyId(req._id);
    const res = await fetch(`/api/leave-requests/${req._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    if (res.ok) load();
    else alert("Update nahi ho paya.");
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Leave Requests</h1>
        <div className="flex items-center gap-3">
          <a href="/hr/holidays" className="text-sm text-slate-500 hover:text-slate-800 underline">
            Holiday Calendar
          </a>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-slate-200/90 bg-white/85 rounded-xl shadow-sm px-3 py-1.5"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50/80 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Koi request nahi mili.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r._id} className="border-t border-slate-100/80">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{r.employee?.fullName}</p>
                  <p className="text-xs text-slate-400">{r.employee?.employeeId}</p>
                </td>
                <td className="px-4 py-3">{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                <td className="px-4 py-3">
                  {formatDateDMY(r.fromDate)} → {formatDateDMY(r.toDate)}
                </td>
                <td className="px-4 py-3 text-slate-500">{r.note || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      r.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : r.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === r._id}
                        onClick={() => handleReview(r, "approved")}
                        className="text-xs text-emerald-700 font-medium hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === r._id}
                        onClick={() => handleReview(r, "rejected")}
                        className="text-xs text-red-600 font-medium hover:underline"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
