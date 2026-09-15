"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/employee/dashboard", label: "Home", icon: HomeIcon },
  { href: "/employee/attendance", label: "Attendance", icon: ClockIcon },
  { href: "/employee/leave", label: "Leave", icon: CalendarIcon },
  { href: "/employee/salary", label: "Salary", icon: WalletIcon },
];

export default function EmployeeShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const initial = session?.user?.email?.[0]?.toUpperCase() || "E";

  async function handleSignOut() {
    await fetch("/api/auth/role-signout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "employee" }),
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-100/50 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-20 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>
      <header className="h-16 shrink-0 bg-slate-950/88 backdrop-blur-2xl text-white flex items-center px-3 sm:px-5 gap-4 z-30 border-b border-white/10 shadow-xl shadow-slate-950/10 sticky top-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 ring-1 ring-white/25 shadow-lg shadow-indigo-500/30 flex items-center justify-center font-black text-sm">
            A
          </div>
          <span className="font-semibold tracking-wide text-sm hidden sm:inline">A-One Automation</span>
        </div>

        <div className="flex-1" />

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 shadow-lg flex items-center justify-center text-sm font-semibold hover:bg-white/20 transition"
          >
            {initial}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white/95 backdrop-blur-2xl text-slate-800 border border-white rounded-2xl shadow-2xl text-sm z-40 w-52 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium truncate">{session?.user?.email}</p>
                <p className="text-xs text-slate-400 uppercase">Employee</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <nav className="hidden md:flex w-24 shrink-0 bg-slate-950/95 backdrop-blur-2xl flex-col items-center py-5 gap-1 border-r border-white/5 shadow-2xl shadow-slate-950/10">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`w-[76px] rounded-2xl flex flex-col items-center gap-1.5 py-3 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? "text-white bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0 overflow-x-hidden pb-24 md:pb-0 relative z-10">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-white/20 bg-slate-950/90 backdrop-blur-2xl shadow-2xl shadow-slate-950/30 px-1.5 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex-1 rounded-xl flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-all ${
                active ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25" : "text-slate-400"
              }`}>
              <Icon active={active} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function c(active) {
  return active ? "#ffffff" : "#94a3b8";
}
function HomeIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z" stroke={c(active)} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c(active)} strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke={c(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CalendarIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke={c(active)} strokeWidth="1.8" />
      <path d="M4 10h16M8 3v4M16 3v4" stroke={c(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function WalletIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke={c(active)} strokeWidth="1.8" />
      <path d="M3 10h18M16 14h2" stroke={c(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
