"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/holidays")
      .then((res) => res.json())
      .then((data) => setHolidays(data.holidays || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, name }),
    });
    setSaving(false);
    setDate("");
    setName("");
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Ye holiday hatana hai?")) return;
    await fetch(`/api/holidays/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-slate-900">Holiday Calendar</h1>
        <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <p className="text-sm text-slate-500">
          Yahan jo bhi holiday add karenge, wo saare employees ke attendance me automatically
          "Holiday" mark ho jayega us date pe — Check In/Check Out ki zarurat nahi hogi, aur
          salary calculation me paid din ki tarah gina jayega.
        </p>

        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-3">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Holiday ka naam (e.g. Diwali)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
          >
            Add
          </button>
        </form>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    Koi holiday add nahi hua.
                  </td>
                </tr>
              )}
              {holidays.map((h) => (
                <tr key={h._id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{h.date}</td>
                  <td className="px-4 py-2">{h.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400">
          Note: Weekly-off (Sunday) automatically har hafte apply hota hai, isko yahan add karne
          ki zarurat nahi hai.
        </p>
      </main>
    </div>
  );
}
