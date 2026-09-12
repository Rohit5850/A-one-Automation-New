"use client";

import { useEffect, useState } from "react";

const LEAVE_TYPE_LABELS = {
  earned: "Earned Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
};

function daysInclusive(from, to) {
  if (!from || !to) return 0;
  return Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
}

function Donut({ available, total, label, color }) {
  const pct = total > 0 ? Math.min(100, (available / total) * 100) : available > 0 ? 100 : 0;
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${pct}%, #e2e8f0 ${pct}% 100%)`,
        }}
      >
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-center">
          <span className="text-xs font-medium text-slate-700 leading-tight">
            {available === Infinity ? "∞" : available}
            <br />
            Days
            <br />
            Available
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLeavePage() {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  function load() {
    fetch("/api/leave-balance")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance))
      .catch((err) => console.error(err));
    fetch("/api/leave-requests")
      .then((res) => res.json())
      .then((data) => setHistory(data.requests || []))
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    load();
  }, []);

  const pending = history.filter((h) => h.status === "pending");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Leave</p>
        <button
          onClick={() => setShowPanel(true)}
          className="bg-[#5b4ff0] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
        >
          Request Leave
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <p className="font-medium text-slate-900 mb-3">Pending leave requests</p>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">Hurray! No pending leave requests.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => (
              <li key={r._id} className="text-sm text-slate-700 flex justify-between border-b border-slate-50 pb-2">
                <span>
                  {LEAVE_TYPE_LABELS[r.leaveType]} · {r.fromDate} to {r.toDate}
                </span>
                <span className="text-amber-600 text-xs font-medium">PENDING</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="font-medium text-slate-900 mb-3">Leave Balances</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-800 self-start">Earned Leave</p>
            <Donut
              available={balance?.earned.available ?? 0}
              total={balance?.earned.annualQuota ?? 18}
              color="#5b4ff0"
            />
            <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
              <div>
                <p className="uppercase">Available</p>
                <p className="text-slate-800 font-medium">{balance?.earned.available ?? "-"} days</p>
              </div>
              <div>
                <p className="uppercase">Consumed</p>
                <p className="text-slate-800 font-medium">{balance?.earned.consumed ?? "-"} days</p>
              </div>
              <div>
                <p className="uppercase">Accrued so far</p>
                <p className="text-slate-800 font-medium">{balance?.earned.accruedSoFar ?? "-"} days</p>
              </div>
              <div>
                <p className="uppercase">Annual Quota</p>
                <p className="text-slate-800 font-medium">{balance?.earned.annualQuota ?? "-"} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-800 self-start">Paternity Leave</p>
            <Donut
              available={balance?.paternity.available ?? 0}
              total={balance?.paternity.annualQuota ?? 5}
              color="#0d9488"
            />
            <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
              <div>
                <p className="uppercase">Available</p>
                <p className="text-slate-800 font-medium">{balance?.paternity.available ?? "-"} days</p>
              </div>
              <div>
                <p className="uppercase">Consumed</p>
                <p className="text-slate-800 font-medium">{balance?.paternity.consumed ?? "-"} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-800 self-start">Unpaid Leave</p>
            <Donut available={Infinity} total={0} color="#94a3b8" />
            <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
              <div>
                <p className="uppercase">Available</p>
                <p className="text-slate-800 font-medium">∞</p>
              </div>
              <div>
                <p className="uppercase">Consumed</p>
                <p className="text-slate-800 font-medium">{balance?.unpaid.consumed ?? "-"} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <p className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm">
          Leave History
        </p>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2">Dates</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Days</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No leave history to show.
                </td>
              </tr>
            )}
            {history.map((h) => (
              <tr key={h._id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  {h.fromDate} → {h.toDate}
                </td>
                <td className="px-4 py-2">{LEAVE_TYPE_LABELS[h.leaveType]}</td>
                <td className="px-4 py-2">{daysInclusive(h.fromDate, h.toDate)}</td>
                <td className="px-4 py-2 text-slate-500">{h.note || "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      h.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : h.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPanel && (
        <RequestLeavePanel
          balance={balance}
          onClose={() => setShowPanel(false)}
          onSaved={() => {
            setShowPanel(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function RequestLeavePanel({ balance, onClose, onSaved }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const days = daysInclusive(fromDate, toDate);

  async function handleSubmit() {
    if (!fromDate || !toDate || !leaveType) {
      setError("From date, To date aur Leave type zaroori hain.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate, toDate, leaveType, note }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Request submit nahi ho paya.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl p-6 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Request Leave</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">
            ✕
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">From</p>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm font-medium text-slate-800 outline-none"
            />
          </div>
          <p className="text-xs text-slate-400">{days > 0 ? `${days} days` : "0 days"}</p>
          <div>
            <p className="text-xs text-slate-400">To</p>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm font-medium text-slate-800 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700">Select type of leave you want to apply</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            <option value="earned">
              Earned Leave — {balance?.earned.available ?? "-"} days available
            </option>
            <option value="paternity">
              Paternity Leave — {balance?.paternity.available ?? "-"} days available
            </option>
            <option value="unpaid">Unpaid Leave — infinite balance</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Type here"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-md bg-[#5b4ff0] text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Requesting..." : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
