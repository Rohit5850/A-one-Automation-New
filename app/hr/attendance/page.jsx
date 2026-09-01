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

export default function HRAttendancePage() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");

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
    loadHistory(emp._id);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">Mark Attendance</h1>
        <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to Dashboard
        </Link>
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
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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
