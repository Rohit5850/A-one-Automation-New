"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Form() {
  const query = useSearchParams();
  const router = useRouter();
  const token = query.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Reset failed");
      return;
    }
    router.replace("/login?reset=success");
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      {error && <div className="text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}
      <PasswordField label="New Password" value={newPassword} visible={showNewPassword} onChange={setNewPassword} onToggle={() => setShowNewPassword((v) => !v)} />
      <PasswordField label="Confirm New Password" value={confirmPassword} visible={showConfirmPassword} onChange={setConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
      <button disabled={loading || !token} className="w-full h-12 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Saving..." : "Reset Password"}
      </button>
    </form>
  );
}

function PasswordField({ label, value, visible, onChange, onToggle }) {
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="w-full h-12 border rounded-lg px-3 pr-12" />
      <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 px-4 text-slate-500 hover:text-slate-700" aria-label={visible ? `Hide ${label}` : `Show ${label}`} title={visible ? "Hide password" : "Show password"}>
        <PasswordEyeIcon open={visible} />
      </button>
    </div>
  );
}

function PasswordEyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5 9 5a15.7 15.7 0 01-2.1 2.6M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <Suspense fallback={<p>Loading...</p>}><Form /></Suspense>
    </main>
  );
}
