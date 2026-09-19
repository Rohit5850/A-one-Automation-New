"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const { update } = useSession(); const router = useRouter();
  const [form,setForm]=useState({currentPassword:"",newPassword:"",confirmPassword:""}); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setError("");setLoading(true);const res=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json().catch(()=>({}));if(!res.ok){setError(data.error||"Password change nahi hua");setLoading(false);return;}await update({mustChangePassword:false});const p=await fetch("/api/auth/persist-role",{method:"POST"});const d=await p.json().catch(()=>({}));router.replace(d.role==="hr"?"/hr/dashboard":"/employee/dashboard");router.refresh();}
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-5"><form onSubmit={submit} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"><div><h1 className="text-xl font-semibold">Change Password</h1><p className="text-sm text-slate-500 mt-1">First login/reset ke baad default password change karna required hai.</p></div>{error&&<div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}{[["currentPassword","Current Password"],["newPassword","New Password"],["confirmPassword","Confirm New Password"]].map(([k,l])=><input key={k} type="password" required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l} className="w-full h-12 border border-slate-300 rounded-lg px-3 outline-none focus:border-indigo-500"/>)}<button disabled={loading} className="w-full h-12 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-60">{loading?"Saving...":"Change Password"}</button></form></main>;
}
