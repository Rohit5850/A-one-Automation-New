import dbConnect from "./dbConnect";
import Employee from "@/app/models/Employee";
import LeaveRequest from "@/app/models/LeaveRequest";
import Holiday from "@/app/models/Holiday";
import Attendance from "@/app/models/Attendance";
import OvertimeEntry from "@/app/models/OvertimeEntry";
import { dateKeyFromDate, todayDateKey } from "@/app/lib/payrollRules";

const ANNUAL_EARNED_QUOTA = 18;
const ANNUAL_PATERNITY_QUOTA = 5;

function* dateRange(fromDate, toDate) {
  let cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  while (cursor <= end) {
    yield cursor.toISOString().slice(0, 10);
    cursor = new Date(cursor.getTime() + 86400000);
  }
}

function monthsInclusive(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00Z`);
  const to = new Date(`${toDate}T00:00:00Z`);
  return Math.max(0, (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()) + 1);
}

async function workingDates(employeeId, fromDate, toDate) {
  await dbConnect();
  const employee = await Employee.findById(employeeId).select("dateOfJoining dateOfLeaving");
  if (!employee) return [];

  const join = dateKeyFromDate(employee.dateOfJoining);
  const leave = dateKeyFromDate(employee.dateOfLeaving);
  const start = join && fromDate < join ? join : fromDate;
  const end = leave && toDate > leave ? leave : toDate;
  if (start > end) return [];

  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } }).select("date");
  const holidaySet = new Set(holidays.map((h) => h.date));
  const result = [];
  for (const date of dateRange(start, end)) {
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (dow === 0 || holidaySet.has(date)) continue;
    result.push(date);
  }
  return result;
}

export async function countLeaveWorkingDays(employeeId, fromDate, toDate) {
  return (await workingDates(employeeId, fromDate, toDate)).length;
}

export async function computeLeaveBalance(employeeId) {
  await dbConnect();
  const employee = await Employee.findById(employeeId).select("dateOfJoining dateOfLeaving");
  const today = todayDateKey();
  const currentYear = today.slice(0, 4);
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const joinDate = dateKeyFromDate(employee?.dateOfJoining) || yearStart;
  const leaveDate = dateKeyFromDate(employee?.dateOfLeaving);
  const accrualStart = joinDate > yearStart ? joinDate : yearStart;
  const accrualEnd = leaveDate && leaveDate < today ? leaveDate : today;

  const [approvedThisYear, attendanceRecords, compOffCredits, approvedCompOffAll, compOffAttendanceRecords] = await Promise.all([
    LeaveRequest.find({
      employee: employeeId,
      status: "approved",
      fromDate: { $lte: yearEnd },
      toDate: { $gte: yearStart },
    }).sort({ createdAt: 1 }),
    Attendance.find({
      employee: employeeId,
      date: { $gte: yearStart, $lte: yearEnd },
    }).select("date status"),
    OvertimeEntry.find({ employee: employeeId, settlement: "comp-off" }).select("date compOffDays"),
    LeaveRequest.find({ employee: employeeId, status: "approved", leaveType: "comp-off" }).sort({ createdAt: 1 }),
    Attendance.find({ employee: employeeId, status: "leave" }).select("date status"),
  ]);
  const attendanceMap = new Map(attendanceRecords.map((r) => [r.date, r.status]));

  let consumedEarned = 0;
  let consumedPaternity = 0;
  let consumedUnpaid = 0;
  let consumedCompOff = 0;
  const countedDates = new Set();

  for (const req of approvedThisYear) {
    const from = req.fromDate < yearStart ? yearStart : req.fromDate;
    const to = req.toDate > yearEnd ? yearEnd : req.toDate;
    const dates = await workingDates(employeeId, from, to);
    for (const date of dates) {
      if (countedDates.has(date)) continue;
      // An approved leave only consumes balance while that day is actually
      // recorded as leave. If the employee later works/punches, balance is restored.
      if (attendanceMap.get(date) !== "leave") continue;
      countedDates.add(date);
      if (req.leaveType === "earned") consumedEarned++;
      else if (req.leaveType === "paternity") consumedPaternity++;
      else if (req.leaveType === "unpaid") consumedUnpaid++;
    }
  }

  const compOffAttendanceMap = new Map(compOffAttendanceRecords.map((r) => [r.date, r.status]));
  const compOffCountedDates = new Set();
  for (const req of approvedCompOffAll) {
    const dates = await workingDates(employeeId, req.fromDate, req.toDate);
    for (const date of dates) {
      if (compOffCountedDates.has(date) || compOffAttendanceMap.get(date) !== "leave") continue;
      compOffCountedDates.add(date);
      consumedCompOff++;
    }
  }
  // C-Off credits carry forward until used. No silent year-end expiry is applied.
  const compOffEarned = Math.round(compOffCredits.reduce((sum, e) => sum + Number(e.compOffDays || 0), 0) * 10) / 10;

  const monthsWorkedThisYear = accrualStart <= accrualEnd ? monthsInclusive(accrualStart, accrualEnd) : 0;
  const accruedSoFar = Math.min(ANNUAL_EARNED_QUOTA, Math.round(monthsWorkedThisYear * 1.5 * 10) / 10);

  return {
    earned: {
      available: Math.max(0, accruedSoFar - consumedEarned),
      consumed: consumedEarned,
      accruedSoFar,
      annualQuota: ANNUAL_EARNED_QUOTA,
    },
    paternity: {
      available: Math.max(0, ANNUAL_PATERNITY_QUOTA - consumedPaternity),
      consumed: consumedPaternity,
      annualQuota: ANNUAL_PATERNITY_QUOTA,
    },
    compOff: {
      available: Math.max(0, Math.round((compOffEarned - consumedCompOff) * 10) / 10),
      consumed: consumedCompOff,
      earned: compOffEarned,
    },
    unpaid: { consumed: consumedUnpaid },
  };
}
