"use client";

import { formatDateDMY, formatTime24 } from "@/app/lib/displayFormat";

import { useEffect, useState, useCallback, useMemo } from "react";

function todayStr() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function currentMonthStr() {
  return todayStr().slice(0, 7);
}
function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}
function weekdayShort(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}
function monthShort(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
}
function fmtHM(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
function fmtHMS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const ON_TIME_CUTOFF_HOUR = 10; // arrival before 10:00 AM counts as "On Time"

export default function EmployeeAttendancePage() {
  const [now, setNow] = useState(new Date());
  const [month, setMonth] = useState(currentMonthStr());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");
  const [employee, setEmployee] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showLocationToEmployee, setShowLocationToEmployee] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setEmployee(data.employee))
      .catch((err) => console.error(err));
  }, []);

  // live clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadCalendar = useCallback(() => {
    setLoading(true);
    fetch(`/api/my-calendar?month=${month}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setDays(data.days || []);
        setShowLocationToEmployee(!!data.showLocationToEmployee);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [month]);

  const loadTodayAttendance = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance?today=1", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setTodayAttendance(data.record || null);
      setShowLocationToEmployee(!!data.showLocationToEmployee);
      setLocationRequired(!!data.locationRequired);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    loadTodayAttendance();
  }, [loadCalendar, loadTodayAttendance]);

  const today = todayStr();
  const calendarTodayRecord = days.find((d) => d.date === today);
  // Punch button state must come from the direct today endpoint so it survives
  // refresh, logout/login and reopening the page without showing the wrong button.
  const todayRecord = todayAttendance || calendarTodayRecord;

  const LOCATION_REQUIRED_MESSAGE =
    "Please select Allow for location. Only then Check-In or Check-Out is allowed.";

  // Ask the browser for the current GPS location.
  // The native browser permission dialog must be the FIRST prompt the employee sees.
  // We query the permission state only to distinguish an already-blocked site from a
  // fresh permission request. We never show our custom alert before a fresh browser
  // permission decision.
  async function getLocation() {
    if (!navigator.geolocation) {
      const error = new Error("GEOLOCATION_NOT_SUPPORTED");
      error.kind = "unsupported";
      throw error;
    }

    let permissionState = "unknown";
    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        permissionState = permission.state;
      }
    } catch (error) {
      // Permissions API is optional. Geolocation itself still works without it.
      console.debug("Geolocation permission state unavailable", error);
    }

    // If this site was blocked earlier, browsers do not show the native Allow/Deny
    // prompt again. Do not fire our custom popup immediately; show an inline message
    // so the employee can re-enable Location from browser Site Settings.
    if (permissionState === "denied") {
      const error = new Error("LOCATION_ALREADY_BLOCKED");
      error.kind = "already-blocked";
      throw error;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        (geoError) => {
          const error = new Error(geoError?.message || "LOCATION_FAILED");
          error.code = geoError?.code;
          error.kind =
            geoError?.code === 1
              ? "permission-denied"
              : geoError?.code === 2
                ? "position-unavailable"
                : geoError?.code === 3
                  ? "timeout"
                  : "location-failed";
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  async function getFreshEmployee() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) return employee;
      const data = await res.json();
      if (data.employee) {
        setEmployee(data.employee);
        return data.employee;
      }
    } catch (err) {
      console.error(err);
    }
    return employee;
  }

  function handleLocationError(error) {
    if (error?.kind === "permission-denied") {
      // This runs only after the employee answers the native browser prompt with
      // Deny / Never allow / Block during this attendance attempt.
      setMessage(LOCATION_REQUIRED_MESSAGE);
      window.alert(LOCATION_REQUIRED_MESSAGE);
      return;
    }

    if (error?.kind === "already-blocked") {
      // The browser was blocked before this click, so it cannot show the native
      // permission prompt again. Keep this inline instead of showing an immediate
      // custom popup.
      setMessage(
        "Location is blocked in your browser. Open Site Settings, set Location to Allow/Ask, then try again."
      );
      return;
    }

    if (error?.kind === "timeout") {
      setMessage("Location request timed out. Please turn on GPS/location and try again.");
      return;
    }

    if (error?.kind === "position-unavailable") {
      setMessage("Current location could not be detected. Please turn on GPS/location and try again.");
      return;
    }

    if (error?.kind === "unsupported") {
      setMessage("Location is not supported by this browser/device.");
      return;
    }

    setMessage("Current location could not be detected. Please try again.");
  }

  async function handleClockIn() {
    setMarking(true);
    setMessage("");

    // Re-read the employee settings at the moment of attendance so an HR toggle
    // takes effect even if this page was already open in the employee's browser.
    const currentEmployee = await getFreshEmployee();
    const mustCaptureLocation =
      !!currentEmployee?.fieldWorker || !!currentEmployee?.showLocationToEmployee || locationRequired;

    let location = null;
    if (mustCaptureLocation) {
      try {
        // The browser permission prompt is triggered here.
        // If the employee chooses Allow, the flow continues directly to Check-In.
        location = await getLocation();
      } catch (error) {
        // A custom popup is shown ONLY when the employee actively denies the
        // native browser permission request. Other GPS problems stay inline.
        setMarking(false);
        handleLocationError(error);
        return;
      }
    }

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    setMarking(false);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.record) setTodayAttendance(data.record);
      setMessage("Checked in!");
      await Promise.all([loadTodayAttendance(), Promise.resolve(loadCalendar())]);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
      // If database says an active punch already exists, immediately restore the
      // correct Check-Out button instead of leaving the user stuck on Check-In.
      await loadTodayAttendance();
    }
  }

  async function handleClockOut() {
    setMarking(true);
    setMessage("");

    const currentEmployee = await getFreshEmployee();
    const mustCaptureLocation =
      !!currentEmployee?.fieldWorker || !!currentEmployee?.showLocationToEmployee || locationRequired;

    let location = null;
    if (mustCaptureLocation) {
      try {
        // The browser permission prompt is triggered here.
        // If the employee chooses Allow, the flow continues directly to Check-In.
        location = await getLocation();
      } catch (error) {
        // A custom popup is shown ONLY when the employee actively denies the
        // native browser permission request. Other GPS problems stay inline.
        setMarking(false);
        handleLocationError(error);
        return;
      }
    }

    const res = await fetch("/api/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    setMarking(false);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.record) setTodayAttendance(data.record);
      setMessage("Checked out!");
      await Promise.all([loadTodayAttendance(), Promise.resolve(loadCalendar())]);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
      await loadTodayAttendance();
    }
  }

  const todaySessions = todayRecord?.sessions?.length
    ? todayRecord.sessions
    : todayRecord?.checkIn
      ? [{ checkIn: todayRecord.checkIn, checkOut: todayRecord.checkOut }]
      : [];
  const activeSession = [...todaySessions].reverse().find((s) => s.checkIn && !s.checkOut);

  // Live duration is only the CURRENT working session. Previous completed sessions
  // are already included in workedMs, while the gap between sessions is break time.
  const liveDuration = useMemo(() => {
    if (!activeSession?.checkIn) return null;
    return now - new Date(activeSession.checkIn);
  }, [activeSession?.checkIn, now]);

  const workedDays = days.filter((d) => (d.workedMs || 0) > 0);
  const last7 = workedDays.slice(-7);
  const avgMs =
    last7.length > 0
      ? last7.reduce((sum, d) => sum + (d.workedMs || 0), 0) / last7.length
      : 0;
  const onTimeCount = last7.filter((d) => new Date(d.checkIn).getHours() < ON_TIME_CUTOFF_HOUR).length;
  const onTimePct = last7.length > 0 ? Math.round((onTimeCount / last7.length) * 100) : 0;

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDow = (now.getDay() + 6) % 7; // Mon=0...Sun=6

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6">
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Attendance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Stats */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_16px_42px_-28px_rgba(15,23,42,0.32)] p-5">
          <p className="font-medium text-slate-900 mb-4">Attendance Stats</p>
          <p className="text-xs text-slate-400 mb-2">Last 7 working days</p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-slate-400">AVG HRS / DAY</p>
              <p className="text-lg font-semibold text-slate-900">{fmtHM(avgMs)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ON TIME ARRIVAL</p>
              <p className="text-lg font-semibold text-slate-900">{onTimePct}%</p>
            </div>
          </div>
        </div>

        {/* Timings */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_16px_42px_-28px_rgba(15,23,42,0.32)] p-5">
          <p className="font-medium text-slate-900 mb-4">Timings</p>
          <div className="flex justify-between mb-4">
            {weekdays.map((w, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i === todayDow ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400"
                }`}
              >
                {w}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-1">
            Today {todayRecord?.checkIn ? `(${formatTime24(todayRecord.checkIn)}${todayRecord.checkOut ? ` - ${formatTime24(todayRecord.checkOut)}` : ""})` : "(not checked in)"}
          </p>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            {todayRecord?.checkIn && (
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: todayRecord.checkOut ? "100%" : "60%" }}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_16px_42px_-28px_rgba(15,23,42,0.32)] p-5">
          <p className="text-lg font-semibold text-slate-900">
            {formatTime24(now, true)}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {formatDateDMY(now)}
          </p>

          {message && <p className="text-xs text-emerald-600 mb-2">{message}</p>}

          {activeSession ? (
            <>
              <p className="text-xs text-slate-500 mb-1">Since Check-in</p>
              <p className="text-xl font-semibold text-slate-900 mb-3">
                {liveDuration != null ? fmtHMS(liveDuration) : "-"}
              </p>
              <button
                onClick={handleClockOut}
                disabled={marking}
                className="w-full bg-red-500 text-white text-sm font-medium py-2 rounded-md hover:bg-red-600 disabled:opacity-60"
              >
                Web Clock-out
              </button>
            </>
          ) : (
            <>
              {todayRecord?.checkIn && (
                <p className="text-xs text-slate-500 mb-2">
                  Worked: {fmtHM(todayRecord.workedMs || 0)} · Break: {fmtHM(todayRecord.breakMs || 0)}
                </p>
              )}
              <button
                onClick={handleClockIn}
                disabled={marking}
                className="w-full bg-emerald-600 text-white text-sm font-medium py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60"
              >
                Web Clock-in
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-slate-900">Logs & Requests</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="w-7 h-7 rounded-xl border border-slate-200/90 bg-white/85 shadow-sm bg-white hover:bg-slate-50 text-slate-600 text-sm"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-slate-700 w-36 text-center">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="w-7 h-7 rounded-xl border border-slate-200/90 bg-white/85 shadow-sm bg-white hover:bg-slate-50 text-slate-600 text-sm"
            >
              ›
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] overflow-x-auto">
          <div className="min-w-[1120px]">
          <div className={`grid ${showLocationToEmployee ? "grid-cols-[110px_1fr_100px_90px_90px_90px_300px]" : "grid-cols-[110px_1fr_100px_90px_90px_90px]"} px-4 py-2 bg-slate-100 text-slate-500 text-xs font-medium uppercase tracking-wide`}>
            <span>Date</span>
            <span>Attendance</span>
            <span>Worked Hrs</span>
            <span>Break</span>
            <span>Check In</span>
            <span>Check Out</span>
            {showLocationToEmployee && <span>Location</span>}
          </div>

          {loading && <p className="px-4 py-8 text-center text-slate-400 text-sm">Loading...</p>}
          {!loading && days.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-400 text-sm">Koi data nahi hai.</p>
          )}

          {[...days].reverse().map((d) => {
            const isOff = d.status === "week-off" || d.status === "holiday";
            const eff = (d.workedMs || 0) > 0 ? fmtHM(d.workedMs) : null;

            if (isOff) {
              return (
                <div
                  key={d.date}
                  className="grid grid-cols-[110px_1fr] px-4 py-3 border-t border-slate-100/80 bg-slate-50/70 items-center"
                >
                  <span className="text-sm text-slate-700">
                    {formatDateDMY(d.date)}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200 rounded px-2 py-0.5 w-fit">
                    {d.status === "holiday"
                      ? `Holiday${d.reason ? ` - ${d.reason}` : ""}`
                      : "Full day Weekly-off"}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={d.date}
                className={`grid ${showLocationToEmployee ? "grid-cols-[110px_1fr_100px_90px_90px_90px_300px]" : "grid-cols-[110px_1fr_100px_90px_90px_90px]"} px-4 py-3 border-t border-slate-100/80 items-start`}
              >
                <span className="text-sm text-slate-700">
                  {formatDateDMY(d.date)}
                </span>
                <div className="pr-4">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-full max-w-[240px]">
                    {d.checkIn && (
                      <div
                        className={`h-full rounded-full ${
                          d.status === "leave" ? "bg-blue-400" : "bg-teal-400"
                        }`}
                        style={{ width: eff ? "70%" : "25%" }}
                      />
                    )}
                  </div>
                  {d.reason && <p className="text-xs text-slate-400 mt-1">{d.reason}</p>}
                  {d.status === "absent" && (
                    <p className="text-xs text-red-500 mt-1">Absent</p>
                  )}
                </div>
                <span className="text-sm text-slate-700">{eff || "-"}</span>
                <span className="text-sm text-amber-700">{(d.breakMs || 0) > 0 ? fmtHM(d.breakMs) : "-"}</span>
                <span className="text-sm text-slate-700 space-y-0.5">
                  {(d.sessions?.length ? d.sessions : [{ checkIn: d.checkIn }]).map((session, index) => (
                    <div key={index}>{session.checkIn ? formatTime24(session.checkIn) : "-"}</div>
                  ))}
                </span>
                <span className="text-sm text-slate-700 space-y-0.5">
                  {(d.sessions?.length ? d.sessions : [{ checkOut: d.checkOut }]).map((session, index) => (
                    <div key={index}>{session.checkOut ? formatTime24(session.checkOut) : "Working"}</div>
                  ))}
                </span>
                {showLocationToEmployee && (
                  <div className="space-y-1 pr-2">
                    {(d.sessions?.length ? d.sessions : [{ checkInLocation: d.checkInLocation, checkOutLocation: d.checkOutLocation }]).map((session, index) => (
                      <div key={index} className="mb-1">
                        <AttendanceLocation label="IN" loc={session.checkInLocation} />
                        <AttendanceLocation label="OUT" loc={session.checkOutLocation} />
                      </div>
                    ))}
                    {!d.checkInLocation && !d.checkOutLocation && !(d.sessions || []).some((s) => s.checkInLocation || s.checkOutLocation) && (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
        {showLocationToEmployee && (
          <p className="mt-2 text-[10px] text-slate-400">
            Location names © OpenStreetMap contributors. Exact landmark depends on available map data.
          </p>
        )}
      </div>
    </div>
  );
}

function AttendanceLocation({ label, loc }) {
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;

  const displayParts = (loc.displayName || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const primary = loc.landmark || loc.placeName || loc.area || displayParts[0] || "Saved GPS location";
  const structuredSecondary = [loc.area, loc.city, loc.district, loc.state]
    .filter((v, i, arr) => v && arr.indexOf(v) === i)
    .join(", ");
  const secondary = structuredSecondary || displayParts.slice(1, 5).join(", ");

  return (
    <div className="text-xs leading-4">
      <span className="font-semibold text-slate-500 mr-1">{label}:</span>
      <a
        href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
        title={loc.displayName || `${loc.lat}, ${loc.lng}`}
      >
        📍 {primary}
      </a>
      {secondary && <p className="text-slate-500 ml-7">{secondary}</p>}
      {loc.postcode && <p className="text-slate-400 ml-7">PIN: {loc.postcode}</p>}
    </div>
  );
}
