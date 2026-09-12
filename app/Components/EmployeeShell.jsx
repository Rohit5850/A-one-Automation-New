"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/employee/dashboard", label: "Home", icon: HomeIcon },
  { href: "/employee/attendance", label: "Attendance", icon: ClockIcon },
  { href: "/employee/leave", label: "Leave", icon: CalendarIcon },
  { href: "/employee/salary", label: "Salary", icon: WalletIcon },
];

export default function EmployeeShell({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const initial = session?.user?.email?.[0]?.toUpperCase() || "E";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-14 shrink-0 bg-[#5b4ff0] text-white flex items-center px-4 gap-4 z-20">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-medium text-sm hidden sm:inline">A-One Automation</span>
        </div>

        <div className="flex-1" />

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold"
          >
            {initial}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white text-slate-800 border border-slate-200 rounded-md shadow-lg text-sm z-30 w-48 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium truncate">{session?.user?.email}</p>
                <p className="text-xs text-slate-400 uppercase">Employee</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <nav className="w-16 sm:w-20 shrink-0 bg-[#0d1526] flex flex-col items-center py-4 gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex flex-col items-center gap-1 py-3 text-[10px] sm:text-[11px] transition ${
                  active
                    ? "text-white border-l-2 border-[#5b4ff0] bg-white/5"
                    : "text-slate-400 border-l-2 border-transparent hover:text-slate-200"
                }`}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
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
