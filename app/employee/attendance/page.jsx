"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function currentMonthStr() {
  return new Date().toISOString().slice(0, 7);
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
    fetch(`/api/my-calendar?month=${month}`)
      .then((res) => res.json())
      .then((data) => setDays(data.days || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const today = todayStr();
  const todayRecord = days.find((d) => d.date === today);

  // Gets the browser's current GPS location. Returns null if unavailable/denied.
  function getLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleClockIn() {
    setMarking(true);
    setMessage("");

    const location = await getLocation();
    if (employee?.fieldWorker && !location) {
      setMarking(false);
      setMessage(
        "Aap field/site worker hain - check-in ke liye location permission zaroori hai. Browser me location allow karke dubara try karein."
      );
      return;
    }

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    setMarking(false);
    if (res.ok) {
      setMessage("Checked in!");
      loadCalendar();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
    }
  }

  async function handleClockOut() {
    setMarking(true);
    setMessage("");

    const location = await getLocation();
    if (employee?.fieldWorker && !location) {
      setMarking(false);
      setMessage(
        "Aap field/site worker hain - check-out ke liye location permission zaroori hai. Browser me location allow karke dubara try karein."
      );
      return;
    }

    const res = await fetch("/api/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    setMarking(false);
    if (res.ok) {
      setMessage("Checked out!");
      loadCalendar();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Kuch galat ho gaya.");
    }
  }

  // live duration since check-in (if not checked out yet)
  const liveDuration = useMemo(() => {
    if (!todayRecord?.checkIn || todayRecord?.checkOut) return null;
    return now - new Date(todayRecord.checkIn);
  }, [todayRecord, now]);

  // last 7 real working days (present/half-day with both times) for the stats card
  const workedDays = days.filter((d) => d.checkIn && d.checkOut);
  const last7 = workedDays.slice(-7);
  const avgMs =
    last7.length > 0
      ? last7.reduce((sum, d) => sum + (new Date(d.checkOut) - new Date(d.checkIn)), 0) /
        last7.length
      : 0;
  const onTimeCount = last7.filter((d) => new Date(d.checkIn).getHours() < ON_TIME_CUTOFF_HOUR).length;
  const onTimePct = last7.length > 0 ? Math.round((onTimeCount / last7.length) * 100) : 0;

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDow = (now.getDay() + 6) % 7; // Mon=0...Sun=6

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Attendance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Stats */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
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
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="font-medium text-slate-900 mb-4">Timings</p>
          <div className="flex justify-between mb-4">
            {weekdays.map((w, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i === todayDow ? "bg-[#5b4ff0] text-white" : "text-slate-400"
                }`}
              >
                {w}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-1">
            Today {todayRecord?.checkIn ? `(${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${todayRecord.checkOut ? ` - ${new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""})` : "(not checked in)"}
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
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-lg font-semibold text-slate-900">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </p>

          {message && <p className="text-xs text-emerald-600 mb-2">{message}</p>}

          {!todayRecord?.checkIn ? (
            <button
              onClick={handleClockIn}
              disabled={marking}
              className="w-full bg-emerald-600 text-white text-sm font-medium py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60"
            >
              Web Clock-in
            </button>
          ) : !todayRecord?.checkOut ? (
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
            <p className="text-sm text-slate-600">
              Aaj ka din complete ho gaya - {fmtHM(new Date(todayRecord.checkOut) - new Date(todayRecord.checkIn))}
            </p>
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
              className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-sm"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-slate-700 w-36 text-center">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-sm"
            >
              ›
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <div className="min-w-[980px]">
          <div className="grid grid-cols-[110px_1fr_100px_90px_90px_300px] px-4 py-2 bg-slate-100 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <span>Date</span>
            <span>Attendance</span>
            <span>Effective Hrs</span>
            <span>Check In</span>
            <span>Check Out</span>
            <span>Location</span>
          </div>

          {loading && <p className="px-4 py-8 text-center text-slate-400 text-sm">Loading...</p>}
          {!loading && days.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-400 text-sm">Koi data nahi hai.</p>
          )}

          {[...days].reverse().map((d) => {
            const isOff = d.status === "week-off" || d.status === "holiday";
            const eff =
              d.checkIn && d.checkOut
                ? fmtHM(new Date(d.checkOut) - new Date(d.checkIn))
                : null;

            if (isOff) {
              return (
                <div
                  key={d.date}
                  className="grid grid-cols-[110px_1fr] px-4 py-3 border-t border-slate-100 bg-slate-50/70 items-center"
                >
                  <span className="text-sm text-slate-700">
                    {weekdayShort(d.date)}, {d.date.slice(8, 10)} {monthShort(d.date)}
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
                className="grid grid-cols-[110px_1fr_100px_90px_90px_300px] px-4 py-3 border-t border-slate-100 items-start"
              >
                <span className="text-sm text-slate-700">
                  {weekdayShort(d.date)}, {d.date.slice(8, 10)} {monthShort(d.date)}
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
                <span className="text-sm text-slate-700">
                  {d.checkIn
                    ? new Date(d.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "-"}
                </span>
                <span className="text-sm text-slate-700">
                  {d.checkOut
                    ? new Date(d.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "-"}
                </span>
                <div className="space-y-1 pr-2">
                  <AttendanceLocation label="IN" loc={d.checkInLocation} />
                  <AttendanceLocation label="OUT" loc={d.checkOutLocation} />
                  {!d.checkInLocation && !d.checkOutLocation && (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Location names © OpenStreetMap contributors. Exact landmark depends on available map data.
        </p>
      </div>
    </div>
  );
}

function AttendanceLocation({ label, loc }) {
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;

  const primary = loc.landmark || loc.placeName || loc.area || "Saved GPS location";
  const secondary = [loc.area, loc.city, loc.district, loc.state]
    .filter((v, i, arr) => v && arr.indexOf(v) === i)
    .join(", ");

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
