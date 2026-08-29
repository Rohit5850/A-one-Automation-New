"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import EmployeeCard from "@/components/EmployeeCard";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    const meRes = await fetch("/api/me");
    const meData = await meRes.json();
    setEmployee(meData.employee);

    const attRes = await fetch("/api/attendance");
    const attData = await attRes.json();
    setRecords(attData.records || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  async function handleCheckIn() {
    setMarking(true);
    setMessage("");
    const res = await fetch("/api/attendance", { method: "POST" });
    setMarking(false);
    if (res.ok) {
      setMessage("Check-in ho gaya!");
      loadData();
    } else {
      setMessage("Kuch galat ho gaya.");
    }
  }

  async function handleCheckOut() {
    setMarking(true);
    setMessage("");
    const res = await fetch("/api/attendance", { method: "PATCH" });
    setMarking(false);
    if (res.ok) {
      setMessage("Check-out ho gaya!");
      loadData();
    } else {
      setMessage("Kuch galat ho gaya.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">My Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <EmployeeCard employee={employee} />

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <p className="text-sm text-slate-600">Aaj: {today}</p>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={marking || !!todayRecord?.checkIn}
              className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {todayRecord?.checkIn ? "Checked In" : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={marking || !todayRecord?.checkIn || !!todayRecord?.checkOut}
              className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              {todayRecord?.checkOut ? "Checked Out" : "Check Out"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 font-medium text-slate-800 text-sm">
            My Attendance History
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
                  <td className="px-4 py-2">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
