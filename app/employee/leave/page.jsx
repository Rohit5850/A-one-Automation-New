"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateDMY } from "@/lib/displayFormat";

const LEAVE_TYPE_LABELS = {
  earned: "Earned Leave",
  "comp-off": "C-Off / Comp-Off",
  unpaid: "Unpaid Leave",
  paternity: "Paternity Leave (legacy)",
};

function daysInclusive(from, to) {
  if (!from || !to) return 0;
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

function requestDays(request) {
  if (Number(request?.leaveFraction || 1) === 0.5) return 0.5;
  return daysInclusive(request?.fromDate, request?.toDate);
}

function Donut({ available, total, color, unlimited = false }) {
  const numericAvailable = Number(available || 0);
  const numericTotal = Number(total || 0);
  const pct = unlimited
    ? 100
    : numericTotal > 0
      ? Math.max(0, Math.min(100, (numericAvailable / numericTotal) * 100))
      : numericAvailable > 0
        ? 100
        : 0;

  return (
    <div className="leave-donut-wrap">
      <div
        className="leave-donut"
        style={{
          background: `conic-gradient(${color} ${pct}%, #e2e8f0 ${pct}% 100%)`,
        }}
      >
        <div className="leave-donut__inner">
          <span className="leave-donut__text">
            <strong className="leave-donut__number">
              {unlimited ? "∞" : numericAvailable}
            </strong>
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

function StatusBadge({ status }) {
  const styles =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "rejected"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles}`}>
      {status || "pending"}
    </span>
  );
}

export default function EmployeeLeavePage() {
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [balanceResponse, requestResponse] = await Promise.all([
        fetch("/api/leave-balance", { cache: "no-store" }),
        fetch("/api/leave-requests", { cache: "no-store" }),
      ]);

      const balanceData = await balanceResponse.json().catch(() => ({}));
      const requestData = await requestResponse.json().catch(() => ({}));

      if (!balanceResponse.ok) {
        throw new Error(balanceData.error || "Leave balance load nahi ho paya.");
      }
      if (!requestResponse.ok) {
        throw new Error(requestData.error || "Leave requests load nahi ho payi.");
      }

      setBalance(balanceData.balance || null);
      setRequests(requestData.requests || []);
    } catch (error) {
      setPageMessage(error.message || "Leave data load nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const ownRequests = useMemo(() => requests.filter((request) => request.isOwn !== false), [requests]);
  const pendingOwnRequests = useMemo(
    () => ownRequests.filter((request) => request.status === "pending"),
    [ownRequests],
  );
  const reviewRequests = useMemo(
    () => requests.filter((request) => request.canReview && !request.isOwn),
    [requests],
  );

  async function review(id, status) {
    if (reviewingId) return;
    setReviewingId(id);
    setPageMessage("");

    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Leave review failed.");

      setPageMessage(`Leave request ${status}.`);
      await load();
    } catch (error) {
      setPageMessage(error.message || "Leave review failed.");
    } finally {
      setReviewingId("");
    }
  }

  return (
    <div className="leave-page">
      <div className="leave-page__header">
        <div>
          <p className="leave-page__eyebrow">Leave</p>
          <h1 className="leave-page__title">Leave</h1>
          <p className="leave-section-subtitle">
            View your leave balance, request new leave and track your leave history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className="leave-request-button"
        >
          + Request Leave
        </button>
      </div>

      {pageMessage && (
        <div className="leave-message">
          {pageMessage}
        </div>
      )}

      <section className="leave-card leave-pending">
        <div className="leave-section-heading">
          <h2 className="leave-section-title">Pending leave requests</h2>
          <p className="leave-section-subtitle">Your leave requests that are pending approval.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : pendingOwnRequests.length === 0 ? (
          <p className="text-sm text-slate-500">Hurray! No pending leave requests.</p>
        ) : (
          <div className="leave-table-wrap leave-table-wrap--inner">
            <table className="leave-table min-w-[760px]">
              <thead className="leave-table__head">
                <tr>
                  <th className="leave-table__cell">Leave Type</th>
                  <th className="leave-table__cell">From Date</th>
                  <th className="leave-table__cell">To Date</th>
                  <th className="leave-table__cell">Duration</th>
                  <th className="leave-table__cell">Reason</th>
                  <th className="leave-table__cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingOwnRequests.map((request) => (
                  <tr key={request._id} className="leave-table__row">
                    <td className="leave-table__strong">
                      {LEAVE_TYPE_LABELS[request.leaveType] || request.leaveType}
                    </td>
                    <td className="leave-table__cell">{formatDateDMY(request.fromDate)}</td>
                    <td className="leave-table__cell">{formatDateDMY(request.toDate)}</td>
                    <td className="leave-table__cell">
                      {Number(request.leaveFraction || 1) === 0.5
                        ? `Half Day (${request.halfDayPart === "second-half" ? "Second" : "First"} Half)`
                        : `${requestDays(request)} day${requestDays(request) === 1 ? "" : "s"}`}
                    </td>
                    <td className="leave-table__cell">{request.note || "-"}</td>
                    <td className="leave-table__cell"><StatusBadge status={request.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="leave-section-heading leave-section-heading--balance">
          <h2 className="leave-section-title">Leave Balances</h2>
          <p className="leave-section-subtitle">Your current leave balance summary.</p>
        </div>

        <div className="leave-balance-grid">
          <BalanceCard title="Earned Leave">
            <Donut
              available={balance?.earned?.available ?? 0}
              total={balance?.earned?.annualQuota ?? balance?.earned?.accruedSoFar ?? 0}
              color="#16a34a"
            />
            <BalanceStats
              items={[
                ["Available", `${balance?.earned?.available ?? 0} days`],
                ["Consumed", `${balance?.earned?.consumed ?? 0} days`],
                ["Accrued so far", `${balance?.earned?.accruedSoFar ?? 0} days`],
                ["Annual Quota", `${balance?.earned?.annualQuota ?? "-"} days`],
              ]}
            />
          </BalanceCard>

          <BalanceCard title="C-Off / Comp-Off">
            <Donut
              available={balance?.compOff?.available ?? 0}
              total={balance?.compOff?.earned ?? 0}
              color="#7c3aed"
            />
            <BalanceStats
              items={[
                ["Available", `${balance?.compOff?.available ?? 0} days`],
                ["Used", `${balance?.compOff?.consumed ?? 0} days`],
                ["Earned", `${balance?.compOff?.earned ?? 0} days`],
              ]}
            />
          </BalanceCard>

          <BalanceCard title="Unpaid Leave">
            <Donut available={0} total={0} color="#ef4444" unlimited />
            <BalanceStats
              items={[
                ["Available", "Unlimited"],
                ["Consumed", `${balance?.unpaid?.consumed ?? 0} days`],
              ]}
            />
          </BalanceCard>
        </div>
      </section>

      {reviewRequests.length > 0 && (
        <section className="leave-card leave-table-card">
          <div className="leave-table-card__header">
            <h2 className="leave-section-title">Team Leave Approvals</h2>
            <p className="leave-section-subtitle">Requests assigned to you as Reporting Head.</p>
          </div>
          <div className="leave-table-wrap">
            <table className="leave-table min-w-[820px]">
              <thead className="leave-table__head">
                <tr>
                  <th className="leave-table__cell">Employee</th>
                  <th className="leave-table__cell">Type</th>
                  <th className="leave-table__cell">Dates</th>
                  <th className="leave-table__cell">Duration</th>
                  <th className="leave-table__cell">Reason</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewRequests.map((request) => (
                  <tr key={request._id} className="leave-table__row">
                    <td className="leave-table__strong">
                      {request.employee?.fullName || request.employee?.employeeId || "Employee"}
                    </td>
                    <td className="leave-table__cell">{LEAVE_TYPE_LABELS[request.leaveType] || request.leaveType}</td>
                    <td className="leave-table__cell">
                      {formatDateDMY(request.fromDate)} → {formatDateDMY(request.toDate)}
                    </td>
                    <td className="leave-table__cell">
                      {Number(request.leaveFraction || 1) === 0.5
                        ? `Half Day (${request.halfDayPart === "second-half" ? "Second" : "First"} Half)`
                        : `${requestDays(request)} day${requestDays(request) === 1 ? "" : "s"}`}
                    </td>
                    <td className="leave-table__cell">{request.note || "-"}</td>
                    <td className="leave-table__cell">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          disabled={reviewingId === request._id}
                          onClick={() => review(request._id, "approved")}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === request._id}
                          onClick={() => review(request._id, "rejected")}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="leave-card leave-table-card">
        <div className="leave-table-card__header">
          <h2 className="leave-section-title">Leave History</h2>
          <p className="leave-section-subtitle">Your past and current leave requests.</p>
        </div>
        <div className="leave-table-wrap">
          <table className="leave-table min-w-[850px]">
            <thead className="leave-table__head">
              <tr>
                <th className="leave-table__cell">Leave Type</th>
                <th className="leave-table__cell">From Date</th>
                <th className="leave-table__cell">To Date</th>
                <th className="leave-table__cell">Duration</th>
                <th className="leave-table__cell">Reason</th>
                <th className="leave-table__cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && ownRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No leave history to show.
                  </td>
                </tr>
              )}
              {ownRequests.map((request) => (
                <tr key={request._id} className="leave-table__row">
                  <td className="leave-table__strong">
                    {LEAVE_TYPE_LABELS[request.leaveType] || request.leaveType}
                  </td>
                  <td className="leave-table__cell">{formatDateDMY(request.fromDate)}</td>
                  <td className="leave-table__cell">{formatDateDMY(request.toDate)}</td>
                  <td className="leave-table__cell">
                    {Number(request.leaveFraction || 1) === 0.5
                      ? `Half Day (${request.halfDayPart === "second-half" ? "Second" : "First"} Half)`
                      : `${requestDays(request)} day${requestDays(request) === 1 ? "" : "s"}`}
                  </td>
                  <td className="leave-table__cell">{request.note || "-"}</td>
                  <td className="leave-table__cell"><StatusBadge status={request.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      <style jsx global>{`
        .leave-page {
          min-height: 100%;
          padding: 28px 30px 38px;
          color: #172033;
        }
        .leave-page__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }
        .leave-page__eyebrow {
          margin: 0 0 5px;
          color: #8c96a8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .leave-page__title {
          margin: 0;
          color: #111827;
          font-size: 25px;
          line-height: 1.2;
          font-weight: 700;
        }
        .leave-page__subtitle,
        .leave-section-subtitle {
          margin: 5px 0 0;
          color: #7b8495;
          font-size: 13px;
          line-height: 1.5;
        }
        .leave-request-button {
          flex: 0 0 auto;
          min-height: 40px;
          border: 0;
          border-radius: 7px;
          padding: 0 18px;
          background: linear-gradient(135deg, #6557e8 0%, #7956d9 100%);
          color: white;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(91, 76, 220, .18);
          transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        }
        .leave-request-button:hover { transform: translateY(-1px); box-shadow: 0 11px 22px rgba(91,76,220,.23); }
        .leave-request-button:active { transform: translateY(0); }
        .leave-message {
          margin-bottom: 18px;
          border: 1px solid #ddd9ff;
          border-radius: 9px;
          background: #f4f2ff;
          padding: 11px 14px;
          color: #5849c9;
          font-size: 13px;
        }
        .leave-card {
          border: 1px solid #e8ebf1;
          border-radius: 10px;
          background: rgba(255,255,255,.98);
          box-shadow: 0 10px 28px rgba(25, 35, 55, .035);
        }
        .leave-pending { padding: 19px 20px; margin-bottom: 24px; }
        .leave-section-heading { margin-bottom: 14px; }
        .leave-section-heading--balance { margin: 0 0 13px; }
        .leave-section-title { margin: 0; color: #1f2937; font-size: 14px; line-height: 1.4; font-weight: 700; }
        .leave-balance-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .leave-balance-card {
          display: flex;
          min-height: 306px;
          flex-direction: column;
          align-items: stretch;
          gap: 13px;
          border: 1px solid #e7eaf0;
          border-radius: 9px;
          background: #fff;
          padding: 17px 18px 18px;
          box-shadow: 0 9px 24px rgba(25, 35, 55, .035);
        }
        .leave-balance-card__title { margin: 0; color: #273043; font-size: 13px; line-height: 1.35; font-weight: 700; }
        .leave-donut-wrap { display: flex; justify-content: center; padding: 2px 0 4px; }
        .leave-donut { display: flex; width: 116px; height: 116px; align-items: center; justify-content: center; border-radius: 999px; }
        .leave-donut__inner {
          display: flex; width: 84px; height: 84px; align-items: center; justify-content: center;
          border-radius: 999px; background: #fff; text-align: center; box-shadow: inset 0 0 0 1px rgba(226,232,240,.6);
        }
        .leave-donut__text { color: #5d6677; font-size: 10px; font-weight: 600; line-height: 1.35; }
        .leave-donut__number { color: #252d3d; font-size: 20px; font-weight: 700; }
        .leave-balance-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px 16px;
          margin-top: auto;
          padding-top: 3px;
        }
        .leave-balance-stats__label { margin: 0; color: #9aa2b1; font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .leave-balance-stats__value { margin: 3px 0 0; color: #394255; font-size: 11px; font-weight: 700; }
        .leave-table-card { overflow: hidden; margin-top: 0; }
        .leave-table-card + .leave-table-card { margin-top: 22px; }
        .leave-table-card__header { padding: 14px 18px; border-bottom: 1px solid #e9ecf1; }
        .leave-table-wrap { width: 100%; overflow-x: auto; }
        .leave-table-wrap--inner { border: 1px solid #eceef3; border-radius: 8px; }
        .leave-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .leave-table__head { background: #fafbfc; color: #697386; text-align: left; }
        .leave-table th { padding: 11px 14px; font-size: 10px; font-weight: 700; letter-spacing: .04em; }
        .leave-table__row { border-top: 1px solid #eef0f4; }
        .leave-table__cell, .leave-table__strong { padding: 12px 14px; color: #606b7c; vertical-align: middle; }
        .leave-table__strong { color: #313b4d; font-weight: 700; }
        @media (max-width: 1024px) {
          .leave-page { padding: 22px 20px 32px; }
          .leave-balance-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (max-width: 640px) {
          .leave-page { padding: 16px 12px 26px; }
          .leave-page__header { align-items: stretch; flex-direction: column; margin-bottom: 18px; }
          .leave-page__title { font-size: 22px; }
          .leave-request-button { width: 100%; }
          .leave-pending { padding: 16px; }
          .leave-balance-grid { grid-template-columns: 1fr; gap: 12px; }
          .leave-balance-card { min-height: 278px; }
          .leave-table-card__header { padding: 13px 14px; }
        }
      `}</style>

      {showPanel && (
        <RequestLeavePanel
          balance={balance}
          onClose={() => setShowPanel(false)}
          onSaved={async () => {
            setShowPanel(false);
            setPageMessage("Leave request submitted.");
            await load();
          }}
        />
      )}
    </div>
  );
}

function BalanceCard({ title, children }) {
  return (
    <div className="leave-balance-card">
      <h3 className="leave-balance-card__title">{title}</h3>
      {children}
    </div>
  );
}

function BalanceStats({ items }) {
  return (
    <div className="leave-balance-stats">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="leave-balance-stats__label">{label}</p>
          <p className="leave-balance-stats__value">{value}</p>
        </div>
      ))}
    </div>
  );
}

function RequestLeavePanel({ balance, onClose, onSaved }) {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    leaveType: "earned",
    leaveFraction: 1,
    halfDayPart: "first-half",
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const calendarDays = daysInclusive(form.fromDate, form.toDate);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    if (!form.fromDate || !form.toDate || !form.leaveType) {
      setError("From date, To date aur Leave type zaroori hain.");
      return;
    }
    if (form.toDate < form.fromDate) {
      setError("To date, From date se pehle nahi ho sakti.");
      return;
    }
    if (Number(form.leaveFraction) === 0.5 && form.fromDate !== form.toDate) {
      setError("Half-day leave ek single date ke liye apply hoti hai.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leaveFraction: Number(form.leaveFraction),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request submit nahi ho payi.");
      await onSaved();
    } catch (submitError) {
      setError(submitError.message || "Request submit nahi ho payi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close leave request panel"
        className="absolute inset-0 cursor-default bg-slate-950/45"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative h-full w-full max-w-md space-y-5 overflow-y-auto border-l border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Request Leave</h2>
            <p className="mt-1 text-xs text-slate-500">Submit your leave request for approval.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4">
          <Field label="From">
            <input
              required
              type="date"
              value={form.fromDate}
              onChange={(event) => update("fromDate", event.target.value)}
              className="leave-input"
            />
          </Field>
          <Field label="To">
            <input
              required
              type="date"
              value={form.toDate}
              onChange={(event) => update("toDate", event.target.value)}
              className="leave-input"
            />
          </Field>
          <p className="col-span-2 text-center text-xs text-slate-400">
            {calendarDays > 0 ? `${calendarDays} calendar day${calendarDays === 1 ? "" : "s"} selected` : "Select dates"}
          </p>
        </div>

        <Field label="Leave Type">
          <select
            value={form.leaveType}
            onChange={(event) => update("leaveType", event.target.value)}
            className="leave-input"
          >
            <option value="earned">Earned Leave — {balance?.earned?.available ?? 0} days available</option>
            <option value="comp-off">C-Off / Comp-Off — {balance?.compOff?.available ?? 0} days available</option>
            <option value="unpaid">Unpaid Leave — unlimited balance</option>
          </select>
        </Field>

        <Field label="Duration">
          <select
            value={form.leaveFraction}
            onChange={(event) => update("leaveFraction", Number(event.target.value))}
            className="leave-input"
          >
            <option value={1}>Full Day</option>
            <option value={0.5}>Half Day</option>
          </select>
        </Field>

        {Number(form.leaveFraction) === 0.5 && (
          <Field label="Half Day">
            <select
              value={form.halfDayPart}
              onChange={(event) => update("halfDayPart", event.target.value)}
              className="leave-input"
            >
              <option value="first-half">First Half</option>
              <option value="second-half">Second Half</option>
            </select>
          </Field>
        )}

        <Field label="Note / Reason">
          <textarea
            rows={4}
            value={form.note}
            onChange={(event) => update("note", event.target.value)}
            placeholder="Type here"
            className="leave-input resize-none"
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            {saving ? "Requesting..." : "Request"}
          </button>
        </div>

        <style jsx>{`
          .leave-input {
            width: 100%;
            border: 1px solid #cbd5e1;
            border-radius: 0.75rem;
            background: white;
            padding: 0.65rem 0.75rem;
            font-size: 0.875rem;
            color: #334155;
            outline: none;
          }
          .leave-input:focus {
            border-color: #818cf8;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
    </label>
  );
}
