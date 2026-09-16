"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Secure login complete ho raha hai...");
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/persist-role", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.role) { setMessage("Login session save nahi ho paya. Login page par wapas jaiye."); setTimeout(() => router.replace("/login"), 1600); return; }
      router.replace(data.role === "hr" ? "/hr/dashboard" : "/employee/dashboard");
      router.refresh();
    })();
  }, [router]);
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="bg-white rounded-2xl shadow-xl border border-slate-100 px-8 py-7 text-sm text-slate-600">{message}</div></div>;
}
