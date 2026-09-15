"use client";

import { useEffect, useState } from "react";
import { formatDateDMY } from "@/app/lib/displayFormat";

function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function currentMonth() {
  return todayKey().slice(0, 7);
}
function money(v) { return `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }

export default function OvertimePage() {
  const [employees, setEmployees] = useState([]);
  const [entries, setEntries] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [form, setForm] = useState({ employeeId: "", date: todayKey(), hours: "", settlement: "pay", ratePerHour: "", compOffDays: "1", note: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");


  function loadEntries() {
    fetch(`/api/overtime?month=${month}`, { cache: "no-store" })
      .then(r => r.json()).then(d => setEntries(d.entries || []));
  }
  useEffect(() => {
    fetch("/api/salaries", { cache: "no-store" }).then(r => r.json()).then(d => {
      const list = d.employees || []; setEmployees(list);
      if (list[0]) setForm(f => ({ ...f, employeeId: f.employeeId || list[0]._id }));
    });
  }, []);
  useEffect(() => { loadEntries(); }, [month]);

  async function save() {
    setSaving(true); setMessage("");
    const res = await fetch("/api/overtime", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({})); setSaving(false);
    if (!res.ok) { setMessage(data.error || "Save nahi ho paya"); return; }
    setMessage(form.settlement === "pay" ? `Overtime pay ${money(data.entry.amount)} salary me add hoga.` : `${data.entry.compOffDays} C-Off day credit ho gaya.`);
    setForm(f => ({ ...f, hours: "", ratePerHour: "", note: "" })); loadEntries();
  }
  async function remove(id) {
    if (!confirm("Is overtime/C-Off entry ko delete karna hai?")) return;
    const res = await fetch(`/api/overtime/${id}`, { method: "DELETE" });
    if (res.ok) loadEntries();
  }

  return <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Overtime & C-Off</h1>
      <p className="text-sm text-slate-500 mt-1">HR manually overtime enter kare. Pay select karne par salary me add hoga; Holiday/Week Off work par C-Off credit diya ja sakta hai.</p>
    </div>

    <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] p-5 space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="text-sm">Employee
          <select value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} className="mt-1 w-full border rounded-md px-3 py-2">
            {employees.map(e=><option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}
          </select>
        </label>
        <label className="text-sm">Work Date
          <input type="date" max={todayKey()} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="mt-1 w-full border rounded-md px-3 py-2"/>
          <span className="text-xs text-slate-400">Selected: {formatDateDMY(form.date)}</span>
        </label>
        <label className="text-sm">Overtime Hours
          <input type="number" min="0.01" max="24" step="0.25" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} placeholder="e.g. 2.5" className="mt-1 w-full border rounded-md px-3 py-2"/>
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="text-sm">Settlement
          <select value={form.settlement} onChange={e=>setForm({...form,settlement:e.target.value})} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="pay">Pay in Salary</option>
            <option value="comp-off">C-Off Credit</option>
          </select>
        </label>
        {form.settlement === "pay" ? <label className="text-sm">OT Rate / Hour (optional)
          <input type="number" min="0" step="0.01" value={form.ratePerHour} onChange={e=>setForm({...form,ratePerHour:e.target.value})} placeholder="Blank = auto salary rate ÷ 9" className="mt-1 w-full border rounded-md px-3 py-2"/>
          <span className="text-xs text-slate-400">Employee-wise rate; blank par salary se auto rate.</span>
        </label> : <label className="text-sm">C-Off Credit
          <select value={form.compOffDays} onChange={e=>setForm({...form,compOffDays:e.target.value})} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="0.5">0.5 Day</option><option value="1">1 Day</option>
          </select>
          <span className="text-xs text-slate-400">Sirf Holiday / Week Off work ke liye.</span>
        </label>}
        <label className="text-sm">Note
          <input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Work details" className="mt-1 w-full border rounded-md px-3 py-2"/>
        </label>
      </div>
      {message && <p className={`text-sm ${message.includes("nahi") || message.includes("sirf") ? "text-red-600":"text-emerald-700"}`}>{message}</p>}
      <button disabled={saving || !form.employeeId || !form.hours} onClick={save} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 rounded-md px-4 py-2 text-sm disabled:opacity-50">{saving?"Saving...":"Add Overtime"}</button>
    </div>

    <div className="flex justify-between items-center">
      <h2 className="font-medium">Overtime History</h2>
      <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded-md px-3 py-2 text-sm"/>
    </div>
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="bg-slate-100 text-left"><tr><th className="p-3">Date</th><th className="p-3">Employee</th><th className="p-3">Hours</th><th className="p-3">Settlement</th><th className="p-3">Rate / Amount</th><th className="p-3">C-Off</th><th className="p-3">Note</th><th></th></tr></thead>
        <tbody>{entries.length===0?<tr><td colSpan="8" className="p-6 text-center text-slate-400">No overtime entries.</td></tr>:entries.map(e=><tr key={e._id} className="border-t">
          <td className="p-3">{formatDateDMY(e.date)}</td><td className="p-3">{e.employee?.fullName}<div className="text-xs text-slate-400">{e.employee?.employeeId}</div></td>
          <td className="p-3">{e.hours}</td><td className="p-3">{e.settlement==="pay"?"Salary Pay":"C-Off"}</td>
          <td className="p-3">{e.settlement==="pay"?`${money(e.ratePerHour)}/hr · ${money(e.amount)}`:"-"}</td><td className="p-3">{e.settlement==="comp-off"?`${e.compOffDays} day`:"-"}</td>
          <td className="p-3 text-slate-500">{e.note||"-"}</td><td className="p-3"><button onClick={()=>remove(e._id)} className="text-red-600 text-xs">Delete</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
