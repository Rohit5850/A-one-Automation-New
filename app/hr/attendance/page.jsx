"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EmployeeCard from "@/app/Components/EmployeeCard";
import { formatDateDMY, formatTime24 } from "@/app/lib/displayFormat";

function indiaDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function fmtMs(ms) { if (!ms || ms <= 0) return "-"; const h=Math.floor(ms/3600000), m=Math.floor((ms%3600000)/60000); return `${h}h ${m}m`; }
function statusLabel(r) {
  if (r?.status === "leave") {
    if (r.leaveType === "earned") return "Paid Leave · Earned Leave";
    if (r.leaveType === "comp-off") return `Paid Leave · C-Off ${Number(r.leaveFraction) === 0.5 ? "Half-Day" : "Full-Day"}`;
    return "Unpaid Leave";
  }
  if (r?.status === "half-day") return "Half-Day";
  if (r?.status === "pending") return "Pending";
  return r?.status ? r.status.charAt(0).toUpperCase()+r.status.slice(1) : "-";
}
function timeValue(v) { return v ? formatTime24(v) : ""; }

export default function HRAttendancePage() {
  const [employees,setEmployees]=useState([]), [query,setQuery]=useState(""), [employee,setEmployee]=useState(null), [records,setRecords]=useState([]);
  const [date,setDate]=useState(indiaDateKey()), [checkIn,setCheckIn]=useState(""), [checkOut,setCheckOut]=useState(""), [timeMsg,setTimeMsg]=useState(""), [savingTime,setSavingTime]=useState(false);
  const [statusDate,setStatusDate]=useState(indiaDateKey()), [status,setStatus]=useState("present"), [paidType,setPaidType]=useState("earned"), [reason,setReason]=useState(""), [statusMsg,setStatusMsg]=useState(""), [savingStatus,setSavingStatus]=useState(false);
  const today=indiaDateKey();

  useEffect(()=>{ fetch("/api/employees").then(r=>r.json()).then(d=>setEmployees((d.employees||[]).filter(e=>e.status==="active"))).catch(()=>setEmployees([])); },[]);
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase(); return !q?employees:employees.filter(e=>(e.fullName||"").toLowerCase().includes(q)||(e.employeeId||"").toLowerCase().includes(q));},[employees,query]);
  function load(id){ fetch(`/api/attendance?employeeId=${id}`).then(r=>r.json()).then(d=>setRecords(d.records||[])); }
  function choose(emp){ setEmployee(emp); setDate(today); setStatusDate(today); setTimeMsg(""); setStatusMsg(""); load(emp._id); }
  useEffect(()=>{ const r=records.find(x=>x.date===date); setCheckIn(timeValue(r?.checkIn)); setCheckOut(timeValue(r?.checkOut)); },[date,records]);

  async function saveTime(){
    if(!employee) return; if(!checkIn||!checkOut){setTimeMsg("Check-In aur Check-Out dono required hain.");return;} if(checkOut<=checkIn){setTimeMsg("Check-Out time, Check-In time se greater hona chahiye.");return;}
    setSavingTime(true);setTimeMsg(""); const res=await fetch("/api/attendance/manual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({employeeId:employee._id,date,checkIn,checkOut})}); const d=await res.json().catch(()=>({})); setSavingTime(false);
    if(res.ok){setTimeMsg("Attendance time save ho gaya.");load(employee._id);}else setTimeMsg(d.error||"Attendance time save nahi hua.");
  }
  async function saveStatus(){
    if(!employee)return; let payload={status,leaveType:null,leaveFraction:1};
    if(status==="paid-leave") payload=paidType==="earned"?{status:"leave",leaveType:"earned",leaveFraction:1}:{status:"leave",leaveType:"comp-off",leaveFraction:paidType==="comp-off-half"?0.5:1};
    if(status==="unpaid-leave") payload={status:"leave",leaveType:"unpaid",leaveFraction:1};
    setSavingStatus(true);setStatusMsg(""); const res=await fetch("/api/attendance/manual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({employeeId:employee._id,date:statusDate,...payload,reason})}); const d=await res.json().catch(()=>({})); setSavingStatus(false);
    if(res.ok){setStatusMsg("Attendance status save ho gaya.");setReason("");load(employee._id);}else setStatusMsg(d.error||"Status save nahi hua.");
  }

  return <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    <div className="flex items-end justify-between gap-4 flex-wrap"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Attendance Control</p><h1 className="text-2xl font-bold text-slate-900 mt-1">Mark Attendance</h1><p className="text-sm text-slate-500 mt-1">Employee time aur daily attendance status ko ek clean HR view se manage karein.</p></div><Link href="/hr/employees/all" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm">All Employees</Link></div>

    {!employee ? <div className="space-y-4"><div className="bg-white/90 border border-white rounded-2xl shadow-sm p-4"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by Employee Name / EMP-ID" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"/></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map(emp=><button key={emp._id} onClick={()=>choose(emp)} className="text-left bg-white/90 border border-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">{(emp.fullName||"E").split(" ").map(n=>n[0]).join("").slice(0,2)}</div><div className="min-w-0"><p className="font-semibold text-slate-900 truncate">{emp.fullName}</p><p className="text-xs text-slate-500">{emp.employeeId}</p></div></div></button>)}{!filtered.length&&<p className="text-sm text-slate-400">No employee found.</p>}</div></div> : <>
      <button onClick={()=>setEmployee(null)} className="text-sm font-medium text-indigo-600">← Select another employee</button><EmployeeCard employee={employee}/>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-white/90 border border-white rounded-2xl shadow-sm p-5"><div className="mb-5"><p className="font-bold text-slate-900">Manual Check-In / Check-Out</p><p className="text-xs text-slate-500 mt-1">Single-day attendance time correction. Check-Out must be greater than Check-In.</p></div><div className="grid sm:grid-cols-3 gap-3"><label className="text-xs font-medium text-slate-600">Date<input type="date" max={today} value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label><label className="text-xs font-medium text-slate-600">Check-In<input type="time" value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label><label className="text-xs font-medium text-slate-600">Check-Out<input type="time" value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label></div>{timeMsg&&<p className={`text-xs mt-3 ${timeMsg.includes("save ho gaya")?"text-emerald-600":"text-red-600"}`}>{timeMsg}</p>}<button onClick={saveTime} disabled={savingTime} className="mt-4 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{savingTime?"Saving...":"Save Attendance Time"}</button></section>

        <section className="bg-white/90 border border-white rounded-2xl shadow-sm p-5"><div className="mb-5"><p className="font-bold text-slate-900">Mark Attendance Status</p><p className="text-xs text-slate-500 mt-1">Only Present, Absent, Half-Day, Unpaid Leave and Paid Leave.</p></div><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-600">Date<input type="date" max={today} value={statusDate} onChange={e=>setStatusDate(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label><label className="text-xs font-medium text-slate-600">Status<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"><option value="present">Present</option><option value="absent">Absent</option><option value="half-day">Half-Day</option><option value="unpaid-leave">Unpaid Leave</option><option value="paid-leave">Paid Leave</option></select></label></div>{status==="paid-leave"&&<div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3"><label className="text-xs font-semibold text-indigo-800">Paid Leave Type<select value={paidType} onChange={e=>setPaidType(e.target.value)} className="mt-1 w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm text-slate-800"><option value="earned">Earned Leave</option><option value="comp-off-half">C-OFF (Half-Day)</option><option value="comp-off-full">C-OFF (Full-Day)</option></select></label></div>}<label className="block mt-3 text-xs font-medium text-slate-600">Reason / Note<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Optional note" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"/></label>{statusMsg&&<p className={`text-xs mt-3 ${statusMsg.includes("save ho gaya")?"text-emerald-600":"text-red-600"}`}>{statusMsg}</p>}<button onClick={saveStatus} disabled={savingStatus} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{savingStatus?"Saving...":"Save Status"}</button></section>
      </div>
      <section className="bg-white/90 border border-white rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><p className="font-bold text-slate-900">Attendance History</p><p className="text-xs text-slate-500 mt-1">Saved daily time, worked hours, break and final status.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Check-In</th><th className="text-left px-4 py-3">Check-Out</th><th className="text-left px-4 py-3">Worked</th><th className="text-left px-4 py-3">Break</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Reason</th></tr></thead><tbody>{records.map(r=><tr key={r._id} className="border-t border-slate-100"><td className="px-4 py-3">{formatDateDMY(r.date)}</td><td className="px-4 py-3 font-medium">{r.checkIn?formatTime24(r.checkIn):"-"}</td><td className="px-4 py-3 font-medium">{r.checkOut?formatTime24(r.checkOut):(r.checkIn?"Working":"-")}</td><td className="px-4 py-3">{fmtMs(r.workedMs)}</td><td className="px-4 py-3">{fmtMs(r.breakMs)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{statusLabel(r)}</span></td><td className="px-4 py-3 text-slate-500">{r.reason||"-"}</td></tr>)}{!records.length&&<tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No attendance history.</td></tr>}</tbody></table></div></section>
    </>}
  </div>;
}
