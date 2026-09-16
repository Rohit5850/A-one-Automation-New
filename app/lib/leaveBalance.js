import dbConnect from "./dbConnect";
import Employee from "@/app/models/Employee";
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

  const [attendanceRecords, compOffCredits, allCompOffLeaveRecords, yearHolidays] = await Promise.all([
    Attendance.find({
      employee: employeeId,
      date: { $gte: yearStart, $lte: yearEnd },
      status: "leave",
    }).select("date status leaveType reason"),
    OvertimeEntry.find({ employee: employeeId, settlement: "comp-off" }).select("date compOffDays"),
    Attendance.find({ employee: employeeId, status: "leave" }).select("date status leaveType reason"),
    Holiday.find({ date: { $gte: yearStart, $lte: yearEnd } }).select("date"),
  ]);

  // Attendance is the final source of truth. Approved employee leave requests and
  // HR manual leave marking both persist leaveType on Attendance. If an employee
  // later works on that date, status changes away from leave and the balance is
  // automatically restored.
  const yearHolidaySet = new Set(yearHolidays.map((h) => h.date));
  let consumedEarned = 0;
  let consumedPaternity = 0;
  let consumedUnpaid = 0;
  for (const record of attendanceRecords) {
    const isSunday = new Date(`${record.date}T00:00:00Z`).getUTCDay() === 0;
    if (isSunday || yearHolidaySet.has(record.date)) continue;
    const type = record.leaveType || "unpaid";
    if (type === "earned") consumedEarned++;
    else if (type === "paternity") consumedPaternity++;
    else if (type === "unpaid") consumedUnpaid++;
  }

  const consumedCompOff = allCompOffLeaveRecords.filter((record) => record.leaveType === "comp-off").length;
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
