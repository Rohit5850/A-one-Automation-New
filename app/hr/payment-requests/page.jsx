"use client";

import { useEffect, useState } from "react";

const TYPE_LABELS = { loan: "Loan", advance: "Advance" };

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/payment-requests${q}`)
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
    const res = await fetch(`/api/payment-requests/${req._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    if (res.ok) load();
    else alert("Update nahi ho paya.");
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Loan / Advance Requests</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-slate-300 rounded-md px-3 py-1.5"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Monthly Deduction</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Koi request nahi mili.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{r.employee?.fullName}</p>
                  <p className="text-xs text-slate-400">{r.employee?.employeeId}</p>
                </td>
                <td className="px-4 py-3">{TYPE_LABELS[r.type]}</td>
                <td className="px-4 py-3">{money(r.amount)}</td>
                <td className="px-4 py-3">
                  {r.type === "loan" ? `${money(r.monthlyDeduction)} × ${r.totalMonths}mo` : "-"}
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
