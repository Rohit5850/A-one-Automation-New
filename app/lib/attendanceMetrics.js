export const HALF_DAY_MS = 4.5 * 60 * 60 * 1000;
export const FULL_COFF_MS = 9 * 60 * 60 * 1000;

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
  return { sessions, workedMs, breakMs };
}

export function automaticWorkStatus(workedMs, hasActiveSession = false) {
  if (hasActiveSession) return "pending";
  if (!workedMs || workedMs < HALF_DAY_MS) return "absent";
  if (workedMs === HALF_DAY_MS) return "half-day";
  return "present";
}

export function compOffCreditForWorkedMs(workedMs) {
  if (workedMs >= FULL_COFF_MS) return 1;
  if (workedMs >= HALF_DAY_MS) return 0.5;
  return 0;
}
