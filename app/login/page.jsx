"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ya password galat hai.");
      return;
    }

    const persistRes = await fetch("/api/auth/persist-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const persistData = await persistRes.json().catch(() => ({}));
    if (!persistRes.ok || !persistData?.role) {
      setError("Login hua, lekin session save nahi ho paya. Please dubara try karein.");
      return;
    }

    if (persistData.role === "hr") {
      router.push("/hr/dashboard");
    } else {
      router.push("/employee/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-[0_40px_120px_-35px_rgba(0,0,0,0.8)]">
        <div className="hidden lg:flex min-h-[620px] p-10 flex-col justify-between bg-gradient-to-br from-indigo-600/90 via-violet-600/75 to-slate-950/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%)]" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white text-xl font-black shadow-xl">A</div>
            <div>
              <p className="text-white font-semibold tracking-wide">A-One Automation</p>
              <p className="text-indigo-100/70 text-xs">Workforce Management Suite</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-indigo-100/80 text-sm font-medium tracking-[0.2em] uppercase">Smart. Secure. Simple.</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white">Attendance, payroll and people — one premium workspace.</h2>
            <p className="mt-5 text-indigo-100/75 leading-7 max-w-md">Built for a smooth HR and employee experience across desktop and mobile.</p>
          </div>
          <p className="relative text-xs text-indigo-100/55">A-One Automation · Secure Office Access</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-10 lg:p-12 flex items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25">A</div>
              <div><p className="font-semibold text-slate-900">A-One Automation</p><p className="text-xs text-slate-500">Workforce Management</p></div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-indigo-600">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Office Login</h1>
              <p className="text-sm text-slate-500 mt-2">HR aur Employee apne account se securely login karein.</p>
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 shadow-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60 disabled:translate-y-0">
              {loading ? "Signing in..." : "Sign in securely"}
            </button>
            <p className="text-center text-xs text-slate-400">Protected access · Role-based workspace</p>
          </form>
        </div>
      </div>
    </div>
  );
}
