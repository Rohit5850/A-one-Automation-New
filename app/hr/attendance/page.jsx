"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";

function formatDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const ms = new Date(checkOut) - new Date(checkIn);
  if (ms <= 0) return "-";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// Converts a Date's local time into the "HH:MM" value <input type="time"> needs
function toTimeInputValue(dateVal) {
  if (!dateVal) return "";
  return new Date(dateVal).toTimeString().slice(0, 5);
}

export default function HRAttendancePage() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");

  // Manual entry state
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualCheckIn, setManualCheckIn] = useState("");
  const [manualCheckOut, setManualCheckOut] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMessage, setManualMessage] = useState("");

  // Leave / half-day / absent marking state
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().slice(0, 10));
  const [leaveStatus, setLeaveStatus] = useState("leave");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setAllEmployees((data.employees || []).filter((e) => e.status === "active")));
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return allEmployees;
    return allEmployees.filter(
      (e) => e.fullName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)
    );
  }, [allEmployees, filterText]);

  function loadHistory(employeeMongoId) {
    fetch(`/api/attendance?employeeId=${employeeMongoId}`)
      .then((res) => res.json())
      .then((data) => setRecords(data.records || []));
  }

  function selectEmployee(emp) {
    setEmployee(emp);
    setMessage("");
    setManualDate(new Date().toISOString().slice(0, 10));
    setManualCheckIn("");
    setManualCheckOut("");
    setManualMessage("");
    setLeaveDate(new Date().toISOString().slice(0, 10));
    setLeaveStatus("leave");
    setLeaveReason("");
    setLeaveMessage("");
    loadHistory(emp._id);
  }

  // Dates that already have a record for this employee - shown in the filter dropdown
  const existingDates = useMemo(
    () => [...records].map((r) => r.date).sort((a, b) => (a < b ? 1 : -1)),
    [records]
  );

  // Whenever the chosen date changes (typed or picked from the filter),
  // pre-fill the manual time inputs from that date's existing record, if any.
  useEffect(() => {
    const existing = records.find((r) => r.date === manualDate);
    setManualCheckIn(toTimeInputValue(existing?.checkIn));
    setManualCheckOut(toTimeInputValue(existing?.checkOut));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualDate, records]);

  async function handleManualSave() {
    if (!employee) return;
    setManualSaving(true);
    setManualMessage("");
    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: employee._id,
        date: manualDate,
        checkIn: manualCheckIn,
        checkOut: manualCheckOut,
      }),
    });
    setManualSaving(false);
    if (res.ok) {
      setManualMessage(`${manualDate} ka time save ho gaya.`);
      loadHistory(employee._id);
    } else {
      const data = await res.json().catch(() => ({}));
      setManualMessage(data.error || "Save nahi ho paya.");
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  async function handleCheckIn() {
    if (!employee) return;
    setMarking(true);
    setMessage("");
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: employee._id }),
    });
    setMarking(false);
    if (res.ok) {
      setMessage(`Check-in note ho gaya - ${new Date().toLocaleTimeString()}`);
      loadHistory(employee._id);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
    }
  }

  async function handleCheckOut() {
    if (!employee) return;
    setMarking(true);
    setMessage("");
    const res = await fetch("/api/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: employee._id }),
    });
    setMarking(false);
    if (res.ok) {
      setMessage(`Check-out note ho gaya - ${new Date().toLocaleTimeString()}`);
      loadHistory(employee._id);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
    }
  }

  async function handleReset() {
    if (!employee || !todayRecord) return;
    if (!confirm("Aaj ka check-in/check-out entry poori tarah reset karein?")) return;
    setMarking(true);
    setMessage("");
    const res = await fetch(`/api/attendance/${todayRecord._id}`, { method: "DELETE" });
    setMarking(false);
    if (res.ok) {
      setMessage("Reset ho gaya - dubara Check In kar sakte hain.");
    } else {
      setMessage("Reset nahi ho paya, dubara try karein.");
    }
    loadHistory(employee._id);
  }

  async function handleLeaveSave() {
    if (!employee) return;
    setLeaveSaving(true);
    setLeaveMessage("");
    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: employee._id,
        date: leaveDate,
        status: leaveStatus,
        reason: leaveReason,
      }),
    });
    setLeaveSaving(false);
    if (res.ok) {
      setLeaveMessage(`${leaveDate} ko "${leaveStatus}" mark ho gaya.`);
      setLeaveReason("");
      loadHistory(employee._id);
    } else {
      const data = await res.json().catch(() => ({}));
      setLeaveMessage(data.error || "Save nahi ho paya.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">Mark Attendance</h1>
        <div className="flex gap-3">
          <Link
            href="/hr/employees/all"
            className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50"
          >
            All Employees
          </Link>
          <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800 self-center">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {!employee && (
          <>
            <input
              type="text"
              placeholder="Naam ya Employee ID se filter karein..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp._id}
                  onClick={() => selectEmployee(emp)}
                  className="bg-white border border-slate-200 rounded-lg p-3 text-left hover:border-slate-400 hover:shadow-sm transition"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold mb-2">
                    {emp.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-slate-900 truncate">{emp.fullName}</p>
                  <p className="text-xs text-slate-500">{emp.employeeId}</p>
                </button>
              ))}
              {filteredEmployees.length === 0 && (
                <p className="col-span-full text-sm text-slate-400">Koi employee nahi mila.</p>
              )}
            </div>
          </>
        )}

        {employee && (
          <>
            <button
              onClick={() => setEmployee(null)}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              ← Kisi aur employee ko select karein
            </button>

            <EmployeeCard employee={employee} />

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <p className="text-sm text-slate-600">Aaj: {today}</p>
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleCheckIn}
                  disabled={marking || !!todayRecord?.checkIn}
                  className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {todayRecord?.checkIn
                    ? `Checked In (${new Date(todayRecord.checkIn).toLocaleTimeString()})`
                    : "Check In"}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={marking || !todayRecord?.checkIn || !!todayRecord?.checkOut}
                  className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50 disabled:opacity-50"
                >
                  {todayRecord?.checkOut
                    ? `Checked Out (${new Date(todayRecord.checkOut).toLocaleTimeString()})`
                    : "Check Out"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={marking || !todayRecord}
                  className="text-red-600 text-sm px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 disabled:opacity-40"
                >
                  Reset Aaj Ka Time
                </button>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                <p className="text-sm font-medium text-slate-700">Manual Entry (kisi bhi date ke liye)</p>
                {manualMessage && <p className="text-sm text-emerald-600">{manualMessage}</p>}
                <div className="flex gap-3 flex-wrap items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Date</label>
                    <input
                      type="date"
                      value={manualDate}
                      max={today}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>

                  {existingDates.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Ya existing entry choose karein</label>
                      <select
                        value={existingDates.includes(manualDate) ? manualDate : ""}
                        onChange={(e) => e.target.value && setManualDate(e.target.value)}
                        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="">-- Date select karein --</option>
                        {existingDates.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Check-in Time</label>
                    <input
                      type="time"
                      value={manualCheckIn}
                      onChange={(e) => setManualCheckIn(e.target.value)}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Check-out Time</label>
                    <input
                      type="time"
                      value={manualCheckOut}
                      onChange={(e) => setManualCheckOut(e.target.value)}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleManualSave}
                    disabled={manualSaving}
                    className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
                  >
                    {manualSaving ? "Saving..." : "Save Time"}
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Mark Leave / Half-day / Absent
                </p>
                <p className="text-xs text-slate-400">
                  Holiday aur Sunday (week-off) automatically lagte hain -{" "}
                  <Link href="/hr/holidays" className="underline">
                    Holiday Calendar yaha set karein
                  </Link>
                  . Ye section sirf kisi ek employee ki individual leave/absent/half-day mark
                  karne ke liye hai.
                </p>
                {leaveMessage && <p className="text-sm text-emerald-600">{leaveMessage}</p>}
                <div className="flex gap-3 flex-wrap items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Date</label>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Status</label>
                    <select
                      value={leaveStatus}
                      onChange={(e) => setLeaveStatus(e.target.value)}
                      className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    >
                      <option value="leave">Leave</option>
                      <option value="half-day">Half Day</option>
                      <option value="absent">Absent</option>
                      <option value="present">Present (revert to normal)</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex-1 min-w-[180px]">
                    <label className="text-xs text-slate-500">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Sick leave, Personal work..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleLeaveSave}
                    disabled={leaveSaving}
                    className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
                  >
                    {leaveSaving ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm">
                Attendance History
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Check-in Time</th>
                    <th className="px-4 py-2">Check-out Time</th>
                    <th className="px-4 py-2">Total Time</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        Koi record nahi mila.
                      </td>
                    </tr>
                  )}
                  {records.map((r) => (
                    <tr key={r._id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{r.date}</td>
                      <td className="px-4 py-2">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                      </td>
                      <td className="px-4 py-2">{formatDuration(r.checkIn, r.checkOut)}</td>
                      <td className="px-4 py-2 capitalize">{r.status}</td>
                      <td className="px-4 py-2 text-slate-500">{r.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
