import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import Loan from "@/app/models/Loan";
import Transaction from "@/app/models/Transaction";
import { buildMonthCalendar } from "@/app/lib/attendanceCalendar";

function daysInMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function monthsBetween(startMonth, targetMonth) {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ty, tm] = targetMonth.split("-").map(Number);
  return (ty - sy) * 12 + (tm - sm);
}

function prevMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Computes one month's payroll, pulling forward any unpaid balance from the
// previous month (capped recursion depth so it can never run away).
async function computeMonthPayroll(employee, month, depth = 0) {
  const totalDays = daysInMonth(month);
  const days = await buildMonthCalendar(employee._id, month);

  let present = 0,
    halfDay = 0,
    leave = 0,
    absent = 0,
    holiday = 0,
    weekOff = 0;

  for (const d of days) {
    if (d.status === "present") present++;
    else if (d.status === "half-day") halfDay++;
    else if (d.status === "leave") leave++;
    else if (d.status === "absent") absent++;
    else if (d.status === "holiday") holiday++;
    else if (d.status === "week-off") weekOff++;
  }

  // Present, paid holidays, and paid weekly-offs count as full paid days; half-days count as 0.5
  const paidDaysEquivalent = present + holiday + weekOff + halfDay * 0.5;
  const dailyRate =
    employee.wageType === "monthly" ? (employee.salary || 0) / totalDays : employee.salary || 0;
  const grossEarnings = Math.round(dailyRate * paidDaysEquivalent * 100) / 100;

  const loans = await Loan.find({ employee: employee._id, status: "active" });
  let loanDeduction = 0;
  for (const loan of loans) {
    const position = monthsBetween(loan.startMonth, month) + 1; // 1-indexed month of the loan term
    if (position >= 1 && position <= loan.totalMonths) {
      loanDeduction += loan.monthlyDeduction;
    }
  }

  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const txns = await Transaction.find({
    employee: employee._id,
    date: { $gte: start, $lt: end },
  });

  let bonus = 0,
    advance = 0,
    salaryPaid = 0;
  for (const t of txns) {
    if (t.type === "bonus") bonus += t.amount;
    else if (t.type === "advance") advance += t.amount;
    else if (t.type === "salary") salaryPaid += t.amount;
  }

  // Pull forward unpaid balance from the previous month (max 12 months back)
  let previousBalance = 0;
  if (depth < 12) {
    const prevM = prevMonth(month);
    const joinMonth = employee.dateOfJoining
      ? `${new Date(employee.dateOfJoining).getFullYear()}-${String(
          new Date(employee.dateOfJoining).getMonth() + 1
        ).padStart(2, "0")}`
      : null;
    if (!joinMonth || prevM >= joinMonth) {
      const prevResult = await computeMonthPayroll(employee, prevM, depth + 1);
      previousBalance = prevResult.netPayable;
    }
  }

  const netPayable =
    Math.round(
      (previousBalance + grossEarnings + bonus - loanDeduction - salaryPaid - advance) * 100
    ) / 100;

  return {
    month,
    totalDays,
    attendanceSummary: { present, halfDay, leave, absent, holiday, weekOff },
    grossEarnings,
    bonus,
    loanDeduction,
    salaryPaid,
    advance,
    previousBalance,
    netPayable,
  };
}

// GET /api/payroll/[employeeId]?month=YYYY-MM
//   - hr: can view any employee's payroll
//   - employee: can ONLY view their own (employeeId is forced from session, URL value ignored)
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let { employeeId } = await params;
    if (session.user.role === "employee") {
      employeeId = session.user.employeeId; // hard-locked to own record, URL param ignored
    } else if (session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    await dbConnect();
    const employee = await Employee.findById(employeeId).select("+salary");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const payroll = await computeMonthPayroll(employee, month);
    const days = await buildMonthCalendar(employeeId, month);
    const loans = await Loan.find({ employee: employeeId }).sort({ createdAt: -1 });

    return NextResponse.json({ payroll, days, loans, employee });
  } catch (err) {
    console.error("GET /api/payroll/[employeeId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
