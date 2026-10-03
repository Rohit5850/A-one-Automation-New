import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import Loan from "@/app/models/Loan";
import Transaction from "@/app/models/Transaction";
import OvertimeEntry from "@/app/models/OvertimeEntry";
import PayrollSettings from "@/app/models/PayrollSettings";
import { buildMonthCalendar } from "@/app/lib/attendanceCalendar";
import { applyLoanMonth, calculateNetPayable, compareMonths, createLoanStates, monthFromDate, paidDaysFromSummary, roundMoney, salaryRateForMonth, salaryComponentsForMonth, shiftMonth, summarizeAttendance, todayDateKey, } from "@/app/lib/payrollRules";
function daysInMonth(monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    return new Date(y, m, 0).getDate();
}
function nextMonthStart(monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    return new Date(Date.UTC(y, m, 1));
}
function leaveBreakdownFromDays(days = []) {
    const breakdown = { earnedLeave: 0, cOff: 0, unpaidLeave: 0, sandwichUnpaid: 0 };
    for (const day of days) {
        const fraction = Math.min(1, Math.max(0, Number(day?.leaveFraction || 1)));
        if (["leave", "half-day"].includes(day?.status) && day?.leaveType === "earned")
            breakdown.earnedLeave += day.status === "half-day" ? Math.min(0.5, fraction) : fraction;
        else if (["leave", "half-day"].includes(day?.status) && day?.leaveType === "comp-off")
            breakdown.cOff += day.status === "half-day" ? Math.min(0.5, fraction) : fraction;
        else if (["leave", "half-day"].includes(day?.status) && day?.leaveType === "unpaid")
            breakdown.unpaidLeave += day.status === "half-day" ? Math.min(0.5, fraction) : fraction;
        else if (day?.status === "sandwich-unpaid")
            breakdown.sandwichUnpaid += 1;
    }
    return Object.fromEntries(Object.entries(breakdown).map(([key, value]) => [key, roundMoney(value)]));
}
function transactionMonth(txn) {
    return new Date(txn.date).toISOString().slice(0, 7);
}
function payrollStartMonth(employee, targetMonth, loans, transactions) {
    const joinMonth = monthFromDate(employee.dateOfJoining);
    if (joinMonth)
        return joinMonth;
    const candidates = [
        monthFromDate(employee.createdAt),
        ...loans.map((l) => l.startMonth),
        ...transactions.map((t) => transactionMonth(t)),
    ].filter(Boolean);
    if (candidates.length === 0)
        return targetMonth;
    return candidates.reduce((min, value) => (compareMonths(value, min) < 0 ? value : min), candidates[0]);
}
async function computeMonthPayroll(employee, targetMonth) {
    const targetEnd = nextMonthStart(targetMonth);
    const [loans, transactions, overtimeEntries, payrollSettings] = await Promise.all([
        Loan.find({ employee: employee._id }).sort({ startMonth: 1, createdAt: 1 }),
        Transaction.find({ employee: employee._id, date: { $lt: targetEnd } }).sort({ date: 1, createdAt: 1 }),
        OvertimeEntry.find({ employee: employee._id, date: { $lte: `${targetMonth}-31` } }).sort({ date: 1, createdAt: 1 }),
        PayrollSettings.findOne({ key: "default" }).lean(),
    ]);
    const startMonth = payrollStartMonth(employee, targetMonth, loans, transactions);
    const transactionMap = new Map();
    for (const txn of transactions) {
        const m = transactionMonth(txn);
        if (!transactionMap.has(m))
            transactionMap.set(m, []);
        transactionMap.get(m).push(txn);
    }
    const overtimeMap = new Map();
    for (const entry of overtimeEntries) {
        const m = entry.date.slice(0, 7);
        if (!overtimeMap.has(m))
            overtimeMap.set(m, []);
        overtimeMap.get(m).push(entry);
    }
    const loanStates = createLoanStates(loans);
    const currentMonth = todayDateKey().slice(0, 7);
    const leaveMonth = monthFromDate(employee.dateOfLeaving) ||
        (employee.status === "inactive" ? monthFromDate(employee.updatedAt) : null);
    let carryBalance = 0;
    let result = null;
    let month = startMonth;
    // If user asks for a month before any known employment/payroll activity, return zero safely.
    if (compareMonths(targetMonth, startMonth) < 0) {
        const rate = salaryRateForMonth(employee, targetMonth);
        return {
            month: targetMonth,
            totalDays: daysInMonth(targetMonth),
            attendanceSummary: summarizeAttendance([]),
            leaveBreakdown: leaveBreakdownFromDays([]),
            paidDaysEquivalent: 0,
            salaryRate: rate.amount,
            wageType: rate.wageType,
            dailyRate: rate.wageType === "monthly" ? roundMoney(rate.amount / daysInMonth(targetMonth)) : roundMoney(rate.amount),
            grossEarnings: 0,
            salaryComponents: { basicSalary: 0, hra: 0, otherAllowance: 0, basicEarnings: 0, hraEarnings: 0, otherAllowanceEarnings: 0 },
            attendanceDeduction: 0,
            bonus: 0,
            overtimeHours: 0,
            overtimePay: 0,
            loanDeduction: 0,
            loanOutstanding: loanStates.reduce((sum, s) => roundMoney(sum + s.outstanding), 0),
            salaryPaid: 0,
            advance: 0,
            previousBalance: 0,
            netPayable: 0,
        };
    }
    while (compareMonths(month, targetMonth) <= 0) {
        const totalDays = daysInMonth(month);
        const days = await buildMonthCalendar(employee._id, month);
        const attendanceSummary = summarizeAttendance(days);
        const leaveBreakdown = leaveBreakdownFromDays(days);
        const paidDaysEquivalent = paidDaysFromSummary(attendanceSummary);
        const rate = salaryRateForMonth(employee, month);
        const dailyRate = rate.wageType === "monthly"
            ? roundMoney(rate.amount / totalDays)
            : roundMoney(rate.amount);
        const grossEarnings = roundMoney(dailyRate * paidDaysEquivalent);
        const salaryComponents = salaryComponentsForMonth(employee, month);
        const attendanceFactor = rate.wageType === "monthly" && Number(rate.amount || 0) > 0
            ? Math.min(1, Math.max(0, grossEarnings / Number(rate.amount || 0)))
            : 0;
        const componentEarnings = rate.wageType === "monthly"
            ? {
                basicSalary: salaryComponents.basicSalary,
                hra: salaryComponents.hra,
                otherAllowance: salaryComponents.otherAllowance,
                basicEarnings: roundMoney(salaryComponents.basicSalary * attendanceFactor),
                hraEarnings: roundMoney(salaryComponents.hra * attendanceFactor),
                otherAllowanceEarnings: roundMoney(salaryComponents.otherAllowance * attendanceFactor),
            }
            : { basicSalary: 0, hra: 0, otherAllowance: 0, basicEarnings: 0, hraEarnings: 0, otherAllowanceEarnings: 0 };
        const monthTxns = transactionMap.get(month) || [];
        const monthOvertime = overtimeMap.get(month) || [];
        const paidOvertimeEntries = monthOvertime.filter((e) => e.settlement === "pay");
        const overtimeHours = roundMoney(paidOvertimeEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0));
        const overtimePay = roundMoney(paidOvertimeEntries
            .reduce((sum, e) => sum + Number(e.amount || 0), 0));
        let bonus = 0;
        let advance = 0;
        let expense = 0;
        let reimbursementPaid = 0;
        let salaryPaid = 0;
        let manualLoanCollection = 0;
        // Future-dated transactions must not affect a running current-month payroll.
        const today = todayDateKey();
        for (const t of monthTxns) {
            const txnDate = new Date(t.date).toISOString().slice(0, 10);
            if (txnDate > today)
                continue;
            const amount = Number(t.amount || 0);
            if (t.type === "bonus")
                bonus += amount;
            else if (t.type === "advance")
                advance += amount;
            else if (t.type === "expense")
                expense += amount;
            else if (t.type === "reimbursement")
                reimbursementPaid += amount;
            else if (t.type === "salary")
                salaryPaid += amount;
            else if (t.type === "loan-collect")
                manualLoanCollection += amount;
        }
        bonus = roundMoney(bonus);
        advance = roundMoney(advance);
        expense = roundMoney(expense);
        reimbursementPaid = roundMoney(reimbursementPaid);
        salaryPaid = roundMoney(salaryPaid);
        manualLoanCollection = roundMoney(manualLoanCollection);
        const autoEmiAllowed = compareMonths(month, currentMonth) <= 0 && (!leaveMonth || compareMonths(month, leaveMonth) <= 0);
        const loanResult = applyLoanMonth(loanStates, month, manualLoanCollection, autoEmiAllowed);
        const loanDeduction = loanResult.deduction;
        const loanOutstanding = loanResult.outstanding;
        const pfRawBase = payrollSettings?.pfWageBase === "gross" ? grossEarnings : componentEarnings.basicEarnings;
        const pfCeiling = Number(payrollSettings?.pfWageCeiling || 0);
        const pfBase = !payrollSettings?.pfEnabled ? 0 : !pfCeiling ? pfRawBase : payrollSettings?.pfCeilingMode === "eligibility" ? (pfRawBase <= pfCeiling ? pfRawBase : 0) : Math.min(pfRawBase, pfCeiling);
        const esicRawBase = payrollSettings?.esicWageBase === "basic" ? componentEarnings.basicEarnings : grossEarnings;
        const esicCeiling = Number(payrollSettings?.esicWageCeiling || 0);
        const esicBase = !payrollSettings?.esicEnabled ? 0 : !esicCeiling ? esicRawBase : payrollSettings?.esicCeilingMode === "cap" ? Math.min(esicRawBase, esicCeiling) : (esicRawBase <= esicCeiling ? esicRawBase : 0);
        const pfEmployee = roundMoney(pfBase * Number(payrollSettings?.pfEmployeePercent || 0) / 100);
        const pfEmployer = roundMoney(pfBase * Number(payrollSettings?.pfEmployerPercent || 0) / 100);
        const esicEmployee = roundMoney(esicBase * Number(payrollSettings?.esicEmployeePercent || 0) / 100);
        const esicEmployer = roundMoney(esicBase * Number(payrollSettings?.esicEmployerPercent || 0) / 100);
        const statutoryDeduction = roundMoney(pfEmployee + esicEmployee);
        const previousBalance = roundMoney(carryBalance);
        const netPayable = calculateNetPayable({
            previousBalance,
            grossEarnings: grossEarnings + expense,
            bonus,
            overtimePay,
            loanDeduction,
            salaryPaid,
            advance: advance + reimbursementPaid,
            statutoryDeduction,
        });
        result = {
            month,
            totalDays,
            attendanceSummary,
            leaveBreakdown,
            paidDaysEquivalent,
            salaryRate: rate.amount,
            wageType: rate.wageType,
            dailyRate,
            grossEarnings,
            salaryComponents: componentEarnings,
            attendanceDeduction: rate.wageType === "monthly" ? roundMoney(Number(rate.amount || 0) - grossEarnings) : 0,
            bonus,
            overtimeHours,
            overtimePay,
            loanDeduction,
            loanOutstanding,
            salaryPaid,
            advance,
            expense,
            reimbursementPaid,
            advanceNetBalance: roundMoney(advance - expense + reimbursementPaid),
            statutory: { pfEmployee, pfEmployer, esicEmployee, esicEmployer, statutoryDeduction },
            previousBalance,
            netPayable,
        };
        carryBalance = netPayable;
        month = shiftMonth(month, 1);
    }
    return result;
}
// GET /api/payroll/[employeeId]?month=YYYY-MM
//   - hr: can view any employee's payroll
//   - employee: can ONLY view their own (employeeId is forced from session, URL value ignored)
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        let { employeeId } = await params;
        if (session.user.role === "employee") {
            employeeId = session.user.employeeId;
        }
        else if (session.user.role !== "hr") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month") || todayDateKey().slice(0, 7);
        if (!/^\d{4}-\d{2}$/.test(month)) {
            return NextResponse.json({ error: "Invalid month format" }, { status: 400 });
        }
        await dbConnect();
        const employee = await Employee.findById(employeeId).select("+salary +salaryHistory +basicSalary +hra +otherAllowance");
        if (!employee)
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        const payroll = await computeMonthPayroll(employee, month);
        const days = await buildMonthCalendar(employeeId, month);
        const loans = await Loan.find({ employee: employeeId }).sort({ createdAt: -1 });
        return NextResponse.json({ payroll, days, loans, employee });
    }
    catch (err) {
        console.error("GET /api/payroll/[employeeId] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
