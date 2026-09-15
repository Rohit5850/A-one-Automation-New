import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Transaction from "@/app/models/Transaction";
import Employee from "@/app/models/Employee";
import Loan from "@/app/models/Loan";
import {
  applyLoanMonth,
  compareMonths,
  createLoanStates,
  monthFromDate,
  shiftMonth,
  todayDateKey,
} from "@/app/lib/payrollRules";

const ALLOWED_TYPES = new Set(["salary", "bonus", "advance", "loan-collect"]);
const ALLOWED_MODES = new Set(["cash", "online"]);

async function outstandingBeforeManualCollection(employee, targetDate) {
  const targetMonth = targetDate.toISOString().slice(0, 7);
  const targetInstant = targetDate.getTime();
  const [loans, previousCollections] = await Promise.all([
    Loan.find({ employee: employee._id }).sort({ startMonth: 1, createdAt: 1 }),
    Transaction.find({
      employee: employee._id,
      type: "loan-collect",
      date: { $lte: targetDate },
    }).sort({ date: 1, createdAt: 1 }),
  ]);

  const startedLoans = loans.filter((loan) => compareMonths(loan.startMonth, targetMonth) <= 0);
  if (startedLoans.length === 0) return 0;
  const states = createLoanStates(startedLoans);
  const collectionMap = new Map();
  for (const txn of previousCollections) {
    if (new Date(txn.date).getTime() > targetInstant) continue;
    const month = new Date(txn.date).toISOString().slice(0, 7);
    collectionMap.set(month, Number(collectionMap.get(month) || 0) + Number(txn.amount || 0));
  }

  let month = startedLoans.map((l) => l.startMonth).sort()[0];
  const leaveMonth =
    monthFromDate(employee.dateOfLeaving) ||
    (employee.status === "inactive" ? monthFromDate(employee.updatedAt) : null);
  const currentMonth = todayDateKey().slice(0, 7);
  while (compareMonths(month, targetMonth) <= 0) {
    const collection = Number(collectionMap.get(month) || 0);
    const isTarget = month === targetMonth;
    const allowEmi =
      !isTarget &&
      compareMonths(month, currentMonth) <= 0 &&
      (!leaveMonth || compareMonths(month, leaveMonth) <= 0);
    applyLoanMonth(states, month, collection, allowEmi);
    month = shiftMonth(month, 1);
  }
  return states.reduce((sum, state) => sum + Math.max(0, state.outstanding), 0);
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const type = searchParams.get("type");

    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (type && type !== "all") filter.type = type;
    if (month) {
      const start = new Date(`${month}-01T00:00:00Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { employeeId, type, amount, date, mode, remarks } = body;
    const numericAmount = Number(amount);
    const parsedDate = new Date(date);

    if (!employeeId || !type || !date || !mode || !String(remarks || "").trim()) {
      return NextResponse.json(
        { error: "employeeId, type, amount, date, mode aur remarks sab required hain" },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }
    if (!ALLOWED_MODES.has(mode)) {
      return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Amount 0 se bada hona chahiye" }, { status: 400 });
    }
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid transaction date" }, { status: 400 });
    }

    const txnDateKey = parsedDate.toISOString().slice(0, 10);
    if (txnDateKey > todayDateKey()) {
      return NextResponse.json({ error: "Future date ki transaction allowed nahi hai" }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findById(employeeId).select("_id dateOfLeaving status updatedAt");
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    if (type === "loan-collect") {
      const outstanding = await outstandingBeforeManualCollection(employee, parsedDate);
      if (outstanding <= 0) {
        return NextResponse.json({ error: "Employee ka koi outstanding loan nahi hai" }, { status: 400 });
      }
      if (numericAmount > outstanding + 0.009) {
        return NextResponse.json(
          { error: `Loan outstanding sirf ₹${outstanding.toFixed(2)} hai` },
          { status: 400 }
        );
      }
    }

    const transaction = await Transaction.create({
      employee: employeeId,
      type,
      amount: numericAmount,
      date: parsedDate,
      mode,
      remarks: String(remarks).trim(),
      createdBy: session.user.id,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
