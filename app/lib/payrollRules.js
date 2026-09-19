export function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function monthFromDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 7);
}

export function dateKeyFromDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function todayDateKey(timeZone = process.env.APP_TIMEZONE || "Asia/Kolkata") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function compareMonths(a, b) {
  return String(a).localeCompare(String(b));
}

export function shiftMonth(monthStr, delta) {
  const [y, m] = String(monthStr).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthsBetween(startMonth, targetMonth) {
  const [sy, sm] = String(startMonth).split("-").map(Number);
  const [ty, tm] = String(targetMonth).split("-").map(Number);
  return (ty - sy) * 12 + (tm - sm);
}

export function isPaidLeaveType(type) {
  return type === "earned" || type === "comp-off";
}

export function expectedLoanMonths(amount, monthlyDeduction) {
  const principal = Number(amount);
  const emi = Number(monthlyDeduction);
  if (!Number.isFinite(principal) || !Number.isFinite(emi) || principal <= 0 || emi <= 0) return 0;
  return Math.ceil(principal / emi);
}

export function validateLoanTerms(amount, monthlyDeduction, totalMonths) {
  const principal = Number(amount);
  const emi = Number(monthlyDeduction);
  const months = Number(totalMonths);
  if (!Number.isFinite(principal) || principal <= 0) return "Loan amount valid hona chahiye";
  if (!Number.isFinite(emi) || emi <= 0) return "Monthly deduction valid hona chahiye";
  if (!Number.isInteger(months) || months <= 0) return "Total months positive whole number hona chahiye";
  const expected = expectedLoanMonths(principal, emi);
  if (months !== expected) {
    return `Is amount aur monthly deduction ke hisaab se Total Months ${expected} hona chahiye`;
  }
  return null;
}

export function summarizeAttendance(days = []) {
  const summary = {
    present: 0,
    halfDay: 0,
    leave: 0,
    paidLeave: 0,
    unpaidLeave: 0,
    absent: 0,
    holiday: 0,
    weekOff: 0,
    sandwichUnpaid: 0,
  };
  for (const d of days) {
    const fraction = d.status === "leave" ? Math.min(1, Math.max(0, Number(d.leaveFraction || 1))) : 1;
    if (d.status === "present") summary.present += 1;
    else if (d.status === "half-day") summary.halfDay += 1;
    else if (d.status === "leave") {
      summary.leave += fraction;
      if (isPaidLeaveType(d.leaveType)) summary.paidLeave += fraction;
      else summary.unpaidLeave += fraction;
    } else if (d.status === "absent") summary.absent += 1;
    else if (d.status === "holiday") summary.holiday += 1;
    else if (d.status === "week-off") summary.weekOff += 1;
    else if (d.status === "sandwich-unpaid") {
      summary.sandwichUnpaid += 1;
      summary.unpaidLeave += 1;
    }
  }
  Object.keys(summary).forEach((key) => { summary[key] = roundMoney(summary[key]); });
  return summary;
}

export function paidDaysFromSummary(summary = {}) {
  return roundMoney(
    Number(summary.present || 0) +
      Number(summary.paidLeave || 0) +
      Number(summary.holiday || 0) +
      Number(summary.weekOff || 0) +
      Number(summary.halfDay || 0) * 0.5
  );
}

export function salaryComponentsForMonth(employee = {}, month) {
  const history = Array.isArray(employee.salaryHistory) ? employee.salaryHistory : [];
  const applicable = history
    .filter((item) => item?.effectiveMonth && compareMonths(item.effectiveMonth, month) <= 0)
    .sort((a, b) => compareMonths(a.effectiveMonth, b.effectiveMonth));
  const revision = applicable[applicable.length - 1];
  const wageType = revision?.wageType || employee.wageType;
  const amount = revision ? Number(revision.amount || 0) : Number(employee.salary || 0);
  if (wageType !== "monthly") return { basicSalary: 0, hra: 0, otherAllowance: 0, grossSalary: amount };

  const hasHistoricalBreakup = revision && [revision.basicSalary, revision.hra, revision.otherAllowance].some((v) => v !== undefined && v !== null);
  const basicSalary = Number(hasHistoricalBreakup ? revision.basicSalary : employee.basicSalary || 0);
  const hra = Number(hasHistoricalBreakup ? revision.hra : employee.hra || 0);
  const otherAllowance = Number(hasHistoricalBreakup ? revision.otherAllowance : employee.otherAllowance || 0);
  const componentTotal = roundMoney(basicSalary + hra + otherAllowance);
  return {
    basicSalary: roundMoney(basicSalary),
    hra: roundMoney(hra),
    otherAllowance: roundMoney(otherAllowance),
    grossSalary: amount || componentTotal,
  };
}

export function applySundaySandwichRule(days = []) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const isUnpaidBoundary = (day) =>
    Boolean(day) && (day.status === "absent" || (day.status === "leave" && day.leaveType === "unpaid"));
  return days.map((day) => {
    if (day.status !== "week-off") return day;
    const dt = new Date(`${day.date}T00:00:00Z`);
    if (Number.isNaN(dt.getTime()) || dt.getUTCDay() !== 0) return day;
    const previous = new Date(dt.getTime() - 86400000).toISOString().slice(0, 10);
    const next = new Date(dt.getTime() + 86400000).toISOString().slice(0, 10);
    if (!isUnpaidBoundary(byDate.get(previous)) || !isUnpaidBoundary(byDate.get(next))) return day;
    return { ...day, status: "sandwich-unpaid", reason: "Sandwich Rule - Sunday unpaid" };
  });
}

export function createLoanStates(loans = []) {
  return loans.map((loan) => ({
    loan,
    outstanding: roundMoney(loan.amount),
    manualCollected: 0,
    monthsDeducted: 0,
  }));
}

function allocateManualLoanCollection(states, amount, month) {
  let remaining = roundMoney(amount);
  if (remaining <= 0) return 0;
  let appliedTotal = 0;

  const eligible = states
    .filter((s) => compareMonths(s.loan.startMonth, month) <= 0 && s.outstanding > 0)
    .sort((a, b) => {
      const byStart = compareMonths(a.loan.startMonth, b.loan.startMonth);
      if (byStart !== 0) return byStart;
      return String(a.loan._id || "").localeCompare(String(b.loan._id || ""));
    });

  for (const state of eligible) {
    if (remaining <= 0) break;
    const applied = Math.min(state.outstanding, remaining);
    state.outstanding = roundMoney(state.outstanding - applied);
    state.manualCollected = roundMoney(state.manualCollected + applied);
    appliedTotal = roundMoney(appliedTotal + applied);
    remaining = roundMoney(remaining - applied);
  }
  return appliedTotal;
}

export function applyLoanMonth(states, month, manualCollectionAmount = 0, allowAutomaticEmi = true) {
  const manualApplied = allocateManualLoanCollection(states, manualCollectionAmount, month);
  let deduction = 0;

  if (allowAutomaticEmi) {
    for (const state of states) {
      const loan = state.loan;
      const position = monthsBetween(loan.startMonth, month) + 1;
      if (position < 1 || position > Number(loan.totalMonths || 0) || state.outstanding <= 0) continue;

      const emi = Math.min(Number(loan.monthlyDeduction || 0), state.outstanding);
      if (emi <= 0) continue;
      state.outstanding = roundMoney(state.outstanding - emi);
      state.monthsDeducted++;
      deduction = roundMoney(deduction + emi);
    }
  }

  return {
    deduction,
    manualApplied,
    outstanding: roundMoney(states.reduce((sum, state) => sum + Math.max(0, state.outstanding), 0)),
  };
}

export function isPayrollCalendarDate(dateStr, employmentStart, employmentEnd, todayStr) {
  if (employmentStart && dateStr < employmentStart) return false;
  if (employmentEnd && dateStr > employmentEnd) return false;
  if (todayStr && dateStr > todayStr) return false;
  return true;
}

export function calculateNetPayable({
  previousBalance = 0,
  grossEarnings = 0,
  bonus = 0,
  overtimePay = 0,
  loanDeduction = 0,
  salaryPaid = 0,
  advance = 0,
} = {}) {
  return roundMoney(
    Number(previousBalance || 0) +
      Number(grossEarnings || 0) +
      Number(bonus || 0) +
      Number(overtimePay || 0) -
      Number(loanDeduction || 0) -
      Number(salaryPaid || 0) -
      Number(advance || 0)
  );
}

export function salaryRateForMonth(employee = {}, month) {
  const history = Array.isArray(employee.salaryHistory) ? employee.salaryHistory : [];
  const applicable = history
    .filter((item) => item?.effectiveMonth && compareMonths(item.effectiveMonth, month) <= 0)
    .sort((a, b) => compareMonths(a.effectiveMonth, b.effectiveMonth));
  const revision = applicable[applicable.length - 1];
  return {
    amount: revision ? Number(revision.amount || 0) : Number(employee.salary || 0),
    wageType: revision?.wageType || employee.wageType,
  };
}
