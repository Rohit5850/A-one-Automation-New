import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";

// Builds the full list of days in `month` ("YYYY-MM") for one employee,
// merging real Attendance records with automatic Sunday/holiday detection.
// A day with no explicit record is:
//   - "holiday" if it's in the Holiday calendar
//   - "week-off" if it's a Sunday
//   - "absent" if it's a past day with nothing marked
//   - skipped (not returned) if it's today or a future day with nothing marked yet
export async function buildMonthCalendar(employeeId, month) {
  await dbConnect();

  const [year, mon] = month.split("-").map(Number);
  const totalDays = new Date(year, mon, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: `${month}-01`, $lte: `${month}-31` },
  });
  const recordMap = new Map(records.map((r) => [r.date, r]));

  const holidays = await Holiday.find({ date: { $gte: `${month}-01`, $lte: `${month}-31` } });
  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));

  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${month}-${String(d).padStart(2, "0")}`;
    const existing = recordMap.get(dateStr);

    if (existing) {
      days.push({
        date: dateStr,
        status: existing.status,
        reason: existing.reason || "",
        checkIn: existing.checkIn,
        checkOut: existing.checkOut,
        checkInLocation: existing.checkInLocation,
        checkOutLocation: existing.checkOutLocation,
        _id: existing._id,
      });
      continue;
    }

    const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay(); // 0 = Sunday
    if (holidayMap.has(dateStr)) {
      days.push({ date: dateStr, status: "holiday", reason: holidayMap.get(dateStr) });
    } else if (dayOfWeek === 0) {
      days.push({ date: dateStr, status: "week-off", reason: "Sunday" });
    } else if (dateStr < todayStr) {
      days.push({ date: dateStr, status: "absent", reason: "" });
    }
    // today or future with nothing marked -> not included, nothing to report yet
  }

  return days;
}
