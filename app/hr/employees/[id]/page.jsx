"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";

const TABS = ["Attendance", "Payroll", "Transactions", "Details"];

const STATUS_LABELS = {
  present: "Present",
  "half-day": "Half Day",
  leave: "Leave",
  absent: "Absent",
  holiday: "Holiday",
  "week-off": "Week Off",
};

const STATUS_STYLES = {
  present: "bg-emerald-50 text-emerald-700",
  "half-day": "bg-amber-50 text-amber-700",
  leave: "bg-blue-50 text-blue-700",
  absent: "bg-red-50 text-red-700",
  holiday: "bg-purple-50 text-purple-700",
  "week-off": "bg-slate-100 text-slate-500",
};

function currentMonthStr() {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function monthsBetween(startMonth, targetMonth) {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ty, tm] = targetMonth.split("-").map(Number);
  return (ty - sy) * 12 + (tm - sm);
}

function loanOutstandingAsOf(loan, month) {
  const position = monthsBetween(loan.startMonth, month) + 1;
  const monthsPaid = Math.min(Math.max(position, 0), loan.totalMonths);
  return Math.max(0, loan.amount - loan.monthlyDeduction * monthsPaid);
}

const TXN_TYPE_LABELS = {
  salary: "Salary",
  bonus: "Bonus",
  advance: "Advance",
  "loan-collect": "Loan Collect",
};

export default function EmployeeDetailPage({ params }) {
  const { id } = use(params); // Next.js 15+/16: page params are async
  const [employee, setEmployee] = useState(null);
  const [tab, setTab] = useState("Attendance");
  const [month, setMonth] = useState(currentMonthStr());

  const [payrollData, setPayrollData] = useState(null); // { payroll, days, loans, employee }
  const [loadingPayroll, setLoadingPayroll] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [txnTypeFilter, setTxnTypeFilter] = useState("all");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee))
      .catch((err) => console.error("Failed to load employee:", err));
  }, [id]);

  const loadPayroll = useCallback(() => {
    setLoadingPayroll(true);
    fetch(`/api/payroll/${id}?month=${month}`)
      .then((res) => res.json())
      .then((data) => setPayrollData(data))
      .catch((err) => console.error("Failed to load payroll:", err))
      .finally(() => setLoadingPayroll(false));
  }, [id, month]);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const loadTransactions = useCallback(() => {
    const q = new URLSearchParams({ employeeId: id, month, type: txnTypeFilter });
    fetch(`/api/transactions?${q}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch((err) => console.error("Failed to load transactions:", err));
  }, [id, month, txnTypeFilter]);

  useEffect(() => {
    if (tab === "Transactions") loadTransactions();
  }, [tab, loadTransactions]);

  function refreshAll() {
    loadPayroll();
    if (tab === "Transactions") loadTransactions();
  }

  const loans = payrollData?.loans || [];
  const activeLoans = loans.filter((l) => l.status === "active");
  const loanOutstanding = activeLoans.reduce((sum, l) => sum + loanOutstandingAsOf(l, month), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href="/hr/dashboard" className="text-xs text-slate-500 hover:text-slate-800">
              ← Back to Dashboard
            </Link>
            <h1 className="font-semibold text-slate-900 text-lg mt-1">
              {employee?.fullName || "Loading..."}
            </h1>
            <p className="text-xs text-slate-500">{employee?.employeeId}</p>
          </div>

          <div className="relative flex gap-2">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800"
            >
              Make Payment
            </button>
            <button
              onClick={() => setShowActionsMenu((v) => !v)}
              className="bg-white border border-slate-300 text-slate-700 text-sm px-3 py-2 rounded-md hover:bg-slate-50"
            >
              ▾
            </button>
            {showActionsMenu && (
              <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-md shadow-md text-sm z-10 w-40">
                <button
                  onClick={() => {
                    setShowLoanModal(true);
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50"
                >
                  Give Loan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - horizontal, scrollable on small screens */}
        <div className="flex gap-1 mt-4 overflow-x-auto border-b border-slate-200 -mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Month selector - shared by Attendance / Payroll / Transactions tabs */}
        {tab !== "Details" && (
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
        )}

        {tab === "Attendance" && (
          <AttendanceTab payrollData={payrollData} loading={loadingPayroll} />
        )}

        {tab === "Payroll" && (
          <PayrollTab
            payrollData={payrollData}
            loading={loadingPayroll}
            loanOutstanding={loanOutstanding}
            activeLoans={activeLoans}
            month={month}
          />
        )}

        {tab === "Transactions" && (
          <TransactionsTab
            transactions={transactions}
            txnTypeFilter={txnTypeFilter}
            setTxnTypeFilter={setTxnTypeFilter}
          />
        )}

        {tab === "Details" && (
          <DetailsTab employee={employee} payroll={payrollData?.payroll} month={month} />
        )}
      </main>

      {showPaymentModal && (
        <MakePaymentModal
          employeeId={id}
          month={month}
          onClose={() => setShowPaymentModal(false)}
          onSaved={() => {
            setShowPaymentModal(false);
            refreshAll();
          }}
        />
      )}

      {showLoanModal && (
        <GiveLoanModal
          employeeId={id}
          month={month}
          onClose={() => setShowLoanModal(false)}
          onSaved={() => {
            setShowLoanModal(false);
            refreshAll();
          }}
        />
      )}
    </div>
  );
}

// ---------- ATTENDANCE TAB ----------
function AttendanceTab({ payrollData, loading }) {
  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
  const days = payrollData?.days || [];
  const summary = payrollData?.payroll?.attendanceSummary || {};

  const stats = [
    ["Present (P)", summary.present || 0, "text-emerald-700"],
    ["Absent (A)", summary.absent || 0, "text-red-700"],
    ["Half Day (HD)", summary.halfDay || 0, "text-amber-700"],
    ["Leave (L)", summary.leave || 0, "text-blue-700"],
    ["Holiday", summary.holiday || 0, "text-purple-700"],
    ["Week Off", summary.weekOff || 0, "text-slate-500"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(([label, val, color]) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
            <p className={`text-xl font-semibold ${color}`}>{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Check In</th>
              <th className="px-4 py-2">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {days.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Is month ke liye koi data nahi hai.
                </td>
              </tr>
            )}
            {days.map((d) => (
              <tr key={d.date} className="border-t border-slate-100">
                <td className="px-4 py-2">{d.date}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[d.status]}`}>
                    {STATUS_LABELS[d.status] || d.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{d.reason || "-"}</td>
                <td className="px-4 py-2">
                  {d.checkIn ? new Date(d.checkIn).toLocaleTimeString() : "-"}
                </td>
                <td className="px-4 py-2">
                  {d.checkOut ? new Date(d.checkOut).toLocaleTimeString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- PAYROLL TAB ----------
function PayrollTab({ payrollData, loading, loanOutstanding, month }) {
  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
  const p = payrollData?.payroll;
  if (!p) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Dues" value={money(p.netPayable)} />
        <StatCard label="Last Month (Due)" value={money(p.previousBalance)} />
        <StatCard label="Loan Outstanding" value={money(loanOutstanding)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-xl">
        <p className="text-sm font-medium text-slate-700">{monthLabel(month)}</p>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Earnings</p>
          <Row label={`Present / Paid Days`} value={money(p.grossEarnings)} />
          {p.bonus > 0 && <Row label="Bonus" value={money(p.bonus)} />}
          <Row label="Gross Earnings" value={money(p.grossEarnings + p.bonus)} bold />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Payments & Deductions</p>
          {p.salaryPaid > 0 && <Row label="Salary Paid" value={money(p.salaryPaid)} />}
          {p.advance > 0 && <Row label="Advance Paid" value={money(p.advance)} />}
          {p.loanDeduction > 0 && <Row label="Loan EMI Deducted" value={money(p.loanDeduction)} />}
          <Row
            label="Gross Payments"
            value={money(p.salaryPaid + p.advance + p.loanDeduction)}
            bold
          />
        </div>

        <Row label="Previous Month Balance" value={money(p.previousBalance)} />
        <div className="pt-2 border-t border-slate-200">
          <Row label="Net Payable" value={money(p.netPayable)} bold big />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value, bold, big }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className={bold ? "font-medium text-slate-800" : "text-slate-600"}>{label}</span>
      <span className={`${bold ? "font-medium text-slate-900" : "text-slate-700"} ${big ? "text-lg" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ---------- TRANSACTIONS TAB ----------
function TransactionsTab({ transactions, txnTypeFilter, setTxnTypeFilter }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex justify-end">
        <select
          value={txnTypeFilter}
          onChange={(e) => setTxnTypeFilter(e.target.value)}
          className="text-sm border border-slate-300 rounded-md px-2 py-1"
        >
          <option value="all">All Types</option>
          <option value="salary">Salary</option>
          <option value="bonus">Bonus</option>
          <option value="advance">Advance</option>
          <option value="loan-collect">Loan Collect</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-600 text-left">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Mode</th>
            <th className="px-4 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                Is month/type ke liye koi transaction nahi mila.
              </td>
            </tr>
          )}
          {transactions.map((t) => (
            <tr key={t._id} className="border-t border-slate-100">
              <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="px-4 py-2">{TXN_TYPE_LABELS[t.type] || t.type}</td>
              <td className="px-4 py-2">{money(t.amount)}</td>
              <td className="px-4 py-2 capitalize">{t.mode}</td>
              <td className="px-4 py-2 text-slate-500">{t.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- DETAILS TAB ----------
function DetailsTab({ employee, payroll, month }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  if (!employee) return <p className="text-sm text-slate-500">Loading...</p>;

  async function handleDownloadSlip() {
    setSending(true);
    setMessage("");
    try {
      const { generateSalarySlipPdf } = await import("@/app/lib/salarySlip");
      await generateSalarySlipPdf(employee, payroll, month);
    } catch (err) {
      console.error(err);
      setMessage("PDF generate nahi ho paya - 'npm install jspdf' chalaya hai check karein.");
    }
    setSending(false);
  }

  function handleSendWhatsApp() {
    if (!employee.phone) {
      setMessage("Employee ka mobile number registered nahi hai.");
      return;
    }
    const phoneDigits = employee.phone.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hi ${employee.fullName}, aapki salary slip taiyar hai. HR aapko PDF attach karke bhejenge.`
    );
    window.open(`https://wa.me/91${phoneDigits}?text=${text}`, "_blank");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800 mb-2">Employee Detail</p>
        <DetailRow label="Staff Name" value={employee.fullName} />
        <DetailRow label="Mobile Number" value={employee.phone} />
        <DetailRow label="Email" value={employee.email} />
        <DetailRow label="Gender" value={employee.gender} />
        <DetailRow
          label="Date of Joining"
          value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "-"}
        />
        <DetailRow
          label="Date of Leaving"
          value={employee.dateOfLeaving ? new Date(employee.dateOfLeaving).toLocaleDateString() : "-"}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800 mb-2">Salary Detail</p>
        <DetailRow label="Salary" value={`₹${employee.salary ?? "-"}`} />
        <DetailRow label="Salary Type" value={employee.wageType === "daily" ? "Daily Wage" : "Monthly"} />
        <DetailRow
          label="Salary Cycle"
          value={employee.wageType === "daily" ? "Paid per day worked" : "1st to last day, every month"}
        />

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Salary Slip</p>
          {message && <p className="text-xs text-red-600">{message}</p>}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownloadSlip}
              disabled={sending}
              className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
            >
              Download PDF
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              Send via WhatsApp
            </button>
          </div>
          <p className="text-xs text-slate-400">
            WhatsApp button employee ke registered number pe chat khol dega - PDF pehle Download
            karke waha manually attach karein (auto-attach ke liye paid WhatsApp Business API
            chahiye hoti hai).
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800">{value || "-"}</span>
    </div>
  );
}

// ---------- MAKE PAYMENT MODAL ----------
function MakePaymentModal({ employeeId, month, onClose, onSaved }) {
  const [type, setType] = useState("salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("cash");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!amount || !remarks.trim()) {
      setError("Amount aur Remarks dono zaroori hain.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, type, amount: Number(amount), date, mode, remarks }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save nahi ho paya");
      return;
    }
    onSaved();
  }

  return (
    <Modal title="Make Payment" onClose={onClose}>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Field label="Payment Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="advance">Advance Payment</option>
            <option value="loan-collect">Collect Payment (loan)</option>
          </select>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </Field>

        <div className="flex gap-3">
          <Field label="Amount" className="flex-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Mode" className="w-32">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </Field>
        </div>

        <Field label="Remarks (required)">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} />
    </Modal>
  );
}

// ---------- GIVE LOAN MODAL ----------
function GiveLoanModal({ employeeId, month, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [monthlyDeduction, setMonthlyDeduction] = useState("");
  const [totalMonths, setTotalMonths] = useState("");
  const [startMonth, setStartMonth] = useState(month);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!amount || !monthlyDeduction || !totalMonths) {
      setError("Amount, Monthly Deduction aur Total Months zaroori hain.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        amount: Number(amount),
        monthlyDeduction: Number(monthlyDeduction),
        totalMonths: Number(totalMonths),
        startMonth,
        remarks,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save nahi ho paya");
      return;
    }
    onSaved();
  }

  return (
    <Modal title="Give Loan" onClose={onClose}>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Field label="Loan Amount (₹)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </Field>

        <div className="flex gap-3">
          <Field label="Monthly Deduction (₹)" className="flex-1">
            <input
              type="number"
              value={monthlyDeduction}
              onChange={(e) => setMonthlyDeduction(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Total Months" className="flex-1">
            <input
              type="number"
              value={totalMonths}
              onChange={(e) => setTotalMonths(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <Field label="Start Month">
          <input
            type="month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Remarks">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </Field>

        <p className="text-xs text-slate-400">
          Har mahine {monthlyDeduction ? `₹${monthlyDeduction}` : "..."} automatically salary se
          kat jayega, {totalMonths || "..."} mahine tak - koi manual entry nahi karni padegi.
        </p>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} />
    </Modal>
  );
}

// ---------- SHARED MODAL PIECES ----------
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saving }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        onClick={onCancel}
        className="text-sm px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="text-sm px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
