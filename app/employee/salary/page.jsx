"use client";

import { useEffect, useState, useCallback } from "react";

function currentMonthStr() {
  return new Date().toISOString().slice(0, 7);
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
function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const TYPE_LABELS = { loan: "Loan", advance: "Advance" };

export default function EmployeeSalaryPage() {
  const [month, setMonth] = useState(currentMonthStr());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [slipMessage, setSlipMessage] = useState("");

  const loadPayroll = useCallback(() => {
    setLoading(true);
    fetch(`/api/payroll/me?month=${month}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [month]);

  function loadRequests() {
    fetch("/api/payment-requests")
      .then((res) => res.json())
      .then((d) => setRequests(d.requests || []))
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleDownloadSlip() {
    setSending(true);
    setSlipMessage("");
    try {
      const { generateSalarySlipPdf } = await import("@/lib/salarySlip");
      await generateSalarySlipPdf(data.employee, data.payroll, month);
    } catch (err) {
      console.error(err);
      setSlipMessage("PDF generate nahi ho paya - 'npm install jspdf' check karein.");
    }
    setSending(false);
  }

  const p = data?.payroll;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">My Finances</p>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-[#5b4ff0] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
        >
          Request Loan / Advance
        </button>
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-3">
        <button
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          className="w-8 h-8 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-slate-800 w-40 text-center">
          {monthLabel(month)}
        </span>
        <button
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          className="w-8 h-8 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
        >
          ›
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : p ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-xl">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Earnings</p>
            <Row label="Present / Paid Days" value={money(p.grossEarnings)} />
            {p.bonus > 0 && <Row label="Bonus" value={money(p.bonus)} />}
            <Row label="Gross Earnings" value={money(p.grossEarnings + p.bonus)} bold />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
              Payments & Deductions
            </p>
            {p.salaryPaid > 0 && <Row label="Salary Paid" value={money(p.salaryPaid)} />}
            {p.advance > 0 && <Row label="Advance Paid" value={money(p.advance)} />}
            {p.loanDeduction > 0 && <Row label="Loan EMI Deducted" value={money(p.loanDeduction)} />}
          </div>

          <Row label="Previous Month Balance" value={money(p.previousBalance)} />
          <div className="pt-2 border-t border-slate-200">
            <Row label="Net Payable" value={money(p.netPayable)} bold big />
          </div>

          <div className="pt-4 border-t border-slate-100">
            {slipMessage && <p className="text-xs text-red-600 mb-2">{slipMessage}</p>}
            <button
              onClick={handleDownloadSlip}
              disabled={sending}
              className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
            >
              Download Salary Slip
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Data load nahi ho payi.</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <p className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm">
          My Loan / Advance Requests
        </p>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Monthly Deduction</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Koi request nahi ki hai.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{TYPE_LABELS[r.type]}</td>
                <td className="px-4 py-2">{money(r.amount)}</td>
                <td className="px-4 py-2">
                  {r.type === "loan" ? `${money(r.monthlyDeduction)} × ${r.totalMonths}mo` : "-"}
                </td>
                <td className="px-4 py-2 text-slate-500">{r.note || "-"}</td>
                <td className="px-4 py-2">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRequestModal && (
        <RequestModal
          onClose={() => setShowRequestModal(false)}
          onSaved={() => {
            setShowRequestModal(false);
            loadRequests();
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value, bold, big }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className={bold ? "font-medium text-slate-800" : "text-slate-600"}>{label}</span>
      <span
        className={`${bold ? "font-medium text-slate-900" : "text-slate-700"} ${
          big ? "text-lg" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function RequestModal({ onClose, onSaved }) {
  const [type, setType] = useState("loan");
  const [amount, setAmount] = useState("");
  const [monthlyDeduction, setMonthlyDeduction] = useState("");
  const [totalMonths, setTotalMonths] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!amount) {
      setError("Amount zaroori hai.");
      return;
    }
    if (type === "loan" && (!monthlyDeduction || !totalMonths)) {
      setError("Monthly deduction aur total months zaroori hain.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/payment-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: Number(amount),
        monthlyDeduction: monthlyDeduction ? Number(monthlyDeduction) : undefined,
        totalMonths: totalMonths ? Number(totalMonths) : undefined,
        note,
      }),
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Request Loan / Advance</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="loan">Loan (monthly deducted from salary)</option>
            <option value="advance">Advance (one-time, adjusted this month)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {type === "loan" && (
          <div className="flex gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-slate-600">
                Monthly Deduction (₹)
              </label>
              <input
                type="number"
                value={monthlyDeduction}
                onChange={(e) => setMonthlyDeduction(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-slate-600">Total Months</label>
              <input
                type="number"
                value={totalMonths}
                onChange={(e) => setTotalMonths(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <p className="text-xs text-slate-400">
          Ye request HR ko approval ke liye jayegi - approve hote hi aapke dashboard pe status
          update ho jayega.
        </p>

        <div className="flex justify-end gap-2 pt-2">
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
            {saving ? "Sending..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
