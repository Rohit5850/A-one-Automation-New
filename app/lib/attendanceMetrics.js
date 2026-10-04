export const HALF_DAY_MS = 4.5 * 60 * 60 * 1000;
export const STANDARD_WORK_MS = 9 * 60 * 60 * 1000;
export const FULL_COFF_MS = 8 * 60 * 60 * 1000;
export const LATE_CUTOFF_SECONDS = 9 * 60 * 60 + 15 * 60;
export const LATE_WARNING_LIMIT = 3;

export function normalizedSessions(record = {}) {
  let sessions = Array.isArray(record.sessions) ? record.sessions : [];
  if (!sessions.length && record.checkIn) {
    sessions = [{ checkIn: record.checkIn, checkOut: record.checkOut || null, checkInLocation: record.checkInLocation, checkOutLocation: record.checkOutLocation }];
  }
  return [...sessions].sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
}

export function sessionMetrics(record = {}) {
  const sessions = normalizedSessions(record);
  let workedMs = 0;
  let breakMs = 0;
  sessions.forEach((s, i) => {
    if (s.checkIn && s.checkOut) workedMs += Math.max(0, new Date(s.checkOut) - new Date(s.checkIn));
    if (i > 0 && sessions[i - 1]?.checkOut && s.checkIn) breakMs += Math.max(0, new Date(s.checkIn) - new Date(sessions[i - 1].checkOut));
  });
  const extraWorkMs = Math.max(0, workedMs - STANDARD_WORK_MS);
  return { sessions, workedMs, breakMs, extraWorkMs };
}

export function automaticWorkStatus(workedMs, hasActiveSession = false) {
  if (hasActiveSession) return "pending";
  // Attendance duration rule:
  // below 4.5 worked hours  -> Absent
  // 4.5 hours to below 8h  -> Half-Day
  // 8 hours or more        -> Present
  if (!workedMs || workedMs < HALF_DAY_MS) return "absent";
  if (workedMs < FULL_COFF_MS) return "half-day";
  return "present";
}

export function compOffCreditForWorkedMs(workedMs) {
  if (workedMs >= FULL_COFF_MS) return 1;
  if (workedMs >= HALF_DAY_MS) return 0.5;
  return 0;
}

export function indiaSecondsOfDay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const second = Number(parts.find((part) => part.type === "second")?.value);
  if (![hour, minute, second].every(Number.isFinite)) return null;
  return hour * 3600 + minute * 60 + second;
}

export function isLateCheckIn(value) {
  const seconds = indiaSecondsOfDay(value);
  return seconds != null && seconds > LATE_CUTOFF_SECONDS;
}

export function latePolicyMessage(lateCount) {
  const count = Number(lateCount || 0);
  if (count > LATE_WARNING_LIMIT) {
    return `Late Coming: You checked in after 9:15 AM. This is late arrival ${count} this month, so Half-Day will be applied to today's attendance.`;
  }
  return `Late Coming Warning: Please come to the office before 9:15 AM. This is late arrival ${count}/3 this month. After 3 late arrivals, every further late arrival in the same month will be marked Half-Day.`;
}
