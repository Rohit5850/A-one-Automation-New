import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Holiday from "@/app/models/Holiday";
import Employee from "@/app/models/Employee";
import LeaveRequest from "@/app/models/LeaveRequest";
import { dateKeyFromDate, isPayrollCalendarDate, todayDateKey } from "@/app/lib/payrollRules";

function sessionMetrics(existing) {
  let sessions = Array.isArray(existing.sessions) ? existing.sessions : [];
  if (sessions.length === 0 && existing.checkIn) {
    sessions = [
      {
        checkIn: existing.checkIn,
        checkOut: existing.checkOut,
        checkInLocation: existing.checkInLocation,
        checkOutLocation: existing.checkOutLocation,
      },
    ];
  }

  let workedMs = 0;
  let breakMs = 0;
  const sorted = [...sessions].sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
  sorted.forEach((s, index) => {
    if (s.checkIn && s.checkOut) {
      workedMs += Math.max(0, new Date(s.checkOut) - new Date(s.checkIn));
    }
    if (index > 0 && sorted[index - 1]?.checkOut && s.checkIn) {
      breakMs += Math.max(0, new Date(s.checkIn) - new Date(sorted[index - 1].checkOut));
    }
  });

  return { sessions: sorted, workedMs, breakMs };
}

function* dateRange(fromDate, toDate) {
  let cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  while (cursor <= end) {
    yield cursor.toISOString().slice(0, 10);
    cursor = new Date(cursor.getTime() + 86400000);
  }
}

export async function buildMonthCalendar(employeeId, month) {
  await dbConnect();

  const [year, mon] = month.split("-").map(Number);
  const totalDays = new Date(year, mon, 0).getDate();
  const todayStr = todayDateKey();
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-${String(totalDays).padStart(2, "0")}`;

  const [employee, records, holidays, leaveRequests] = await Promise.all([
    Employee.findById(employeeId).select("dateOfJoining dateOfLeaving status updatedAt"),
    Attendance.find({
      employee: employeeId,
      date: { $gte: monthStart, $lte: monthEnd },
    }),
    Holiday.find({ date: { $gte: monthStart, $lte: monthEnd } }),
    LeaveRequest.find({
      employee: employeeId,
      status: "approved",
      fromDate: { $lte: monthEnd },
      toDate: { $gte: monthStart },
    }).sort({ createdAt: 1 }),
  ]);

  const employmentStart = dateKeyFromDate(employee?.dateOfJoining);
  const employmentEnd =
    dateKeyFromDate(employee?.dateOfLeaving) ||
    (employee?.status === "inactive" ? dateKeyFromDate(employee?.updatedAt) : null);
  const recordMap = new Map(records.map((r) => [r.date, r]));
  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));
  const leaveTypeMap = new Map();

  // Approved requests are authoritative for paid-vs-unpaid leave. If legacy
  // overlapping requests exist, the earliest approved request wins per date.
  for (const req of leaveRequests) {
    const from = req.fromDate < monthStart ? monthStart : req.fromDate;
    const to = req.toDate > monthEnd ? monthEnd : req.toDate;
    for (const date of dateRange(from, to)) {
      if (!leaveTypeMap.has(date)) leaveTypeMap.set(date, req.leaveType);
    }
  }

  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${month}-${String(d).padStart(2, "0")}`;

    // Never generate salary/attendance calendar days outside employment or in future.
    if (!isPayrollCalendarDate(dateStr, employmentStart, employmentEnd, todayStr)) continue;

    const existing = recordMap.get(dateStr);
    const dayOfWeek = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
    const holidayName = holidayMap.get(dateStr);

    // Paid holiday/week-off always remains paid. If an attendance record exists
    // on that day, preserve punch/session data for history but don't let a
    // manual Leave/Absent/Half-Day accidentally reduce base salary.
    if (holidayName || dayOfWeek === 0) {
      if (existing) {
        const { sessions, workedMs, breakMs } = sessionMetrics(existing);
        days.push({
          date: dateStr,
          status: holidayName ? "holiday" : "week-off",
          reason: holidayName || "Sunday",
          actualStatus: existing.status,
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          checkInLocation: existing.checkInLocation,
          checkOutLocation: existing.checkOutLocation,
          sessions,
          workedMs,
          breakMs,
          _id: existing._id,
        });
      } else {
        days.push({
          date: dateStr,
          status: holidayName ? "holiday" : "week-off",
          reason: holidayName || "Sunday",
        });
      }
      continue;
    }

    if (existing) {
      const { sessions, workedMs, breakMs } = sessionMetrics(existing);
      days.push({
        date: dateStr,
        status: existing.status,
        reason: existing.reason || "",
        leaveType: existing.status === "leave" ? leaveTypeMap.get(dateStr) || "unpaid" : null,
        checkIn: existing.checkIn,
        checkOut: existing.checkOut,
        checkInLocation: existing.checkInLocation,
        checkOutLocation: existing.checkOutLocation,
        sessions,
        workedMs,
        breakMs,
        _id: existing._id,
      });
      continue;
    }

    if (dateStr < todayStr) {
      days.push({ date: dateStr, status: "absent", reason: "" });
    }
  }

  return days;
}
