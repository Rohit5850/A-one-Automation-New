"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/hr/dashboard", label: "Home", icon: HomeIcon },
  { href: "/hr/employees/all", label: "Org", icon: OrgIcon },
  { href: "/hr/attendance", label: "Attendance", icon: ClockIcon },
  { href: "/hr/leave-requests", label: "Leave", icon: CalendarIcon },
  { href: "/hr/salaries", label: "Finances", icon: WalletIcon },
  { href: "/hr/users", label: "Users", icon: UsersIcon },
];

export default function HRShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const initial = session?.user?.email?.[0]?.toUpperCase() || "H";

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/hr/employees/all?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 shrink-0 bg-[#5b4ff0] text-white flex items-center px-4 gap-4 z-20">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-medium text-sm hidden sm:inline">A-One Automation</span>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center bg-white/15 rounded-md px-3 py-1.5 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-80">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="bg-transparent placeholder-white/70 text-sm outline-none w-full text-white"
            />
          </div>
        </form>

        <div className="flex items-center gap-4 shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold"
              title="Account"
            >
              {initial}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white text-slate-800 border border-slate-200 rounded-md shadow-lg text-sm z-30 w-48 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-medium truncate">{session?.user?.email}</p>
                  <p className="text-xs text-slate-400 uppercase">{session?.user?.role}</p>
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
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
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

        {/* Page content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

// Minimal inline icon set (no external icon library dependency)
function iconColor(active) {
  return active ? "#ffffff" : "#94a3b8";
}
function HomeIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z" stroke={iconColor(active)} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function OrgIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="3" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CalendarIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M4 10h16M8 3v4M16 3v4" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function WalletIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M3 10h18M16 14h2" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke={iconColor(active)} strokeWidth="1.8" />
      <path d="M2 20c0-3 3-5 7-5s7 2 7 5" stroke={iconColor(active)} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="8" r="2.2" stroke={iconColor(active)} strokeWidth="1.6" />
      <path d="M16.5 12c2.8.3 5 2 5.5 4.5" stroke={iconColor(active)} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
