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
import { notifyEmployee } from "@/app/lib/notificationService";

const ALLOWED_TYPES = new Set(["salary", "bonus", "advance", "expense", "reimbursement", "loan-collect"]);
const ALLOWED_MODES = new Set(["cash", "online"]);
const LEDGER_TYPES = new Set(["advance", "expense", "reimbursement"]);

const TYPE_LABELS = {
  salary: "Salary Payment",
  bonus: "Bonus",
  advance: "Advance",
  expense: "Expense",
  reimbursement: "Reimbursement",
  "loan-collect": "Loan Collection",
};


// ============================================================================
// LOAN OUTSTANDING BEFORE MANUAL COLLECTION
// ============================================================================

async function outstandingBeforeManualCollection(employee, targetDate, excludeTransactionId = null) {
  const targetMonth = targetDate.toISOString().slice(0, 7);
  const targetInstant = targetDate.getTime();

  const collectionFilter = {
    employee: employee._id,
    type: "loan-collect",
    date: { $lte: targetDate },
  };

  if (excludeTransactionId) {
    collectionFilter._id = { $ne: excludeTransactionId };
  }

  const [loans, previousCollections] = await Promise.all([
    Loan.find({ employee: employee._id }).sort({ startMonth: 1, createdAt: 1 }),
    Transaction.find(collectionFilter).sort({ date: 1, createdAt: 1 }),
  ]);

  const startedLoans = loans.filter(
    (loan) => compareMonths(loan.startMonth, targetMonth) <= 0
  );

  if (startedLoans.length === 0) return 0;

  const states = createLoanStates(startedLoans);
  const collectionMap = new Map();

  for (const txn of previousCollections) {
    if (new Date(txn.date).getTime() > targetInstant) continue;

    const month = new Date(txn.date).toISOString().slice(0, 7);

    collectionMap.set(
      month,
      Number(collectionMap.get(month) || 0) + Number(txn.amount || 0)
    );
  }

  let month = startedLoans.map((loan) => loan.startMonth).sort()[0];

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

  return states.reduce(
    (sum, state) => sum + Math.max(0, state.outstanding),
    0
  );
}


// ============================================================================
// ADVANCE / EXPENSE / REIMBURSEMENT LEDGER
// ============================================================================

function addLedgerAmount(totals, type, amount) {
  const value = Number(amount || 0);

  if (type === "advance") totals.advance += value;
  if (type === "expense") totals.expense += value;
  if (type === "reimbursement") totals.reimbursement += value;
}

function reimbursementOverage(totals) {
  const allowed = Math.max(0, totals.expense - totals.advance);

  return {
    allowed,
    overage: Math.max(0, totals.reimbursement - allowed),
  };
}

async function validateAdvanceLedgerChange({
  employeeId,
  type,
  newAmount,
  excludeTransactionId = null,
  oldAmount = 0,
}) {
  const filter = {
    employee: employeeId,
    type: { $in: ["advance", "expense", "reimbursement"] },
  };

  if (excludeTransactionId) {
    filter._id = { $ne: excludeTransactionId };
  }

  const rows = await Transaction.find(filter).select("type amount");

  const base = {
    advance: 0,
    expense: 0,
    reimbursement: 0,
  };

  for (const row of rows) {
    addLedgerAmount(base, row.type, row.amount);
  }

  const current = { ...base };

  if (excludeTransactionId) {
    addLedgerAmount(current, type, oldAmount);
  }

  const projected = { ...base };
  addLedgerAmount(projected, type, newAmount);

  const currentState = reimbursementOverage(current);
  const projectedState = reimbursementOverage(projected);

  // Existing bad ledger ko aur worse nahi hone denge.
  // Corrective edit allowed rahega.
  if (projectedState.overage <= currentState.overage + 0.009) {
    return null;
  }

  if (type === "reimbursement") {
    const otherReimbursements = base.reimbursement;

    const payable = Math.max(
      0,
      projected.expense - projected.advance - otherReimbursements
    );

    return `Reimbursement payable sirf ₹${payable.toFixed(2)} hai`;
  }

  return (
    `Is change ke baad total reimbursement ₹${projected.reimbursement.toFixed(2)} ` +
    `allowed reimbursement ₹${projectedState.allowed.toFixed(2)} se zyada ho jayega`
  );
}


// ============================================================================
// GET TRANSACTIONS
// ============================================================================

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

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    let advanceSummary = null;

    if (employeeId) {
      const all = await Transaction.find({
        employee: employeeId,
        type: { $in: ["advance", "expense", "reimbursement"] },
      }).select("type amount");

      const advance = all
        .filter((x) => x.type === "advance")
        .reduce((sum, x) => sum + Number(x.amount || 0), 0);

      const expense = all
        .filter((x) => x.type === "expense")
        .reduce((sum, x) => sum + Number(x.amount || 0), 0);

      const reimbursed = all
        .filter((x) => x.type === "reimbursement")
        .reduce((sum, x) => sum + Number(x.amount || 0), 0);

      advanceSummary = {
        advance,
        expense,
        advanceBalance: Math.max(0, advance - expense),
        reimbursementPayable: Math.max(0, expense - advance - reimbursed),
        reimbursed,
      };
    }

    return NextResponse.json({
      transactions,
      advanceSummary,
    });
  } catch (err) {
    console.error("GET /api/transactions error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


// ============================================================================
// POST NEW TRANSACTION
// ============================================================================

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    const {
      employeeId,
      type,
      amount,
      date,
      mode,
      remarks,
    } = body;

    const numericAmount = Number(amount);
    const parsedDate = new Date(date);
    const cleanRemarks = String(remarks || "").trim();

    if (!employeeId || !type || !date || !mode || !cleanRemarks) {
      return NextResponse.json(
        {
          error:
            "employeeId, type, amount, date, mode aur remarks sab required hain",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MODES.has(mode)) {
      return NextResponse.json(
        { error: "Invalid payment mode" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount 0 se bada hona chahiye" },
        { status: 400 }
      );
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid transaction date" },
        { status: 400 }
      );
    }

    const txnDateKey = parsedDate.toISOString().slice(0, 10);

    if (txnDateKey > todayDateKey()) {
      return NextResponse.json(
        { error: "Future date ki transaction allowed nahi hai" },
        { status: 400 }
      );
    }

    await dbConnect();

    const employee = await Employee.findById(employeeId).select(
      "_id dateOfLeaving status updatedAt"
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }


    // ------------------------------------------------------------------------
    // ADVANCE / EXPENSE / REIMBURSEMENT VALIDATION
    // ------------------------------------------------------------------------

    if (LEDGER_TYPES.has(type)) {
      const ledgerError = await validateAdvanceLedgerChange({
        employeeId,
        type,
        newAmount: numericAmount,
      });

      if (ledgerError) {
        return NextResponse.json(
          { error: ledgerError },
          { status: 400 }
        );
      }
    }


    // ------------------------------------------------------------------------
    // LOAN COLLECTION VALIDATION
    // ------------------------------------------------------------------------

    if (type === "loan-collect") {
      const outstanding = await outstandingBeforeManualCollection(
        employee,
        parsedDate
      );

      if (outstanding <= 0) {
        return NextResponse.json(
          { error: "Employee ka koi outstanding loan nahi hai" },
          { status: 400 }
        );
      }

      if (numericAmount > outstanding + 0.009) {
        return NextResponse.json(
          {
            error: `Loan outstanding sirf ₹${outstanding.toFixed(2)} hai`,
          },
          { status: 400 }
        );
      }
    }


    // ------------------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------------------

    const transaction = await Transaction.create({
      employee: employeeId,
      type,
      amount: numericAmount,
      date: parsedDate,
      mode,
      remarks: cleanRemarks,
      createdBy: session.user.id,
    });


    // ------------------------------------------------------------------------
    // NOTIFICATION
    // ------------------------------------------------------------------------

    await notifyEmployee({
      employeeId,
      eventKey: `transaction:${transaction._id}:created`,
      title: `${TYPE_LABELS[type] || "Payroll Transaction"} Added`,
      message:
        `${TYPE_LABELS[type] || type} ₹${numericAmount.toLocaleString("en-IN")} ` +
        `HR ne add kiya hai. Remarks: ${cleanRemarks}`,
      date: txnDateKey,
      href: "/employee/salary",
    });

    return NextResponse.json(
      { transaction },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/transactions error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


// ============================================================================
// PUT / EDIT TRANSACTION
// ============================================================================

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "hr") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const {
      id,
      amount,
      date,
      mode,
      remarks,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction id required" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const parsedDate = new Date(date);
    const cleanRemarks = String(remarks || "").trim();

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      Number.isNaN(parsedDate.getTime()) ||
      !ALLOWED_MODES.has(mode) ||
      !cleanRemarks
    ) {
      return NextResponse.json(
        {
          error:
            "Valid Amount, Date, Mode aur Remarks required hain",
        },
        { status: 400 }
      );
    }

    if (parsedDate.toISOString().slice(0, 10) > todayDateKey()) {
      return NextResponse.json(
        { error: "Future date allowed nahi hai" },
        { status: 400 }
      );
    }

    await dbConnect();

    const txn = await Transaction.findById(id);

    if (!txn) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }


    // ------------------------------------------------------------------------
    // ADVANCE / EXPENSE / REIMBURSEMENT EDIT VALIDATION
    // ------------------------------------------------------------------------

    if (LEDGER_TYPES.has(txn.type)) {
      const ledgerError = await validateAdvanceLedgerChange({
        employeeId: txn.employee,
        type: txn.type,
        newAmount: numericAmount,
        excludeTransactionId: txn._id,
        oldAmount: Number(txn.amount || 0),
      });

      if (ledgerError) {
        return NextResponse.json(
          { error: ledgerError },
          { status: 400 }
        );
      }
    }


    // ------------------------------------------------------------------------
    // LOAN COLLECTION EDIT VALIDATION
    // ------------------------------------------------------------------------

    if (txn.type === "loan-collect") {
      const employee = await Employee.findById(txn.employee).select(
        "_id dateOfLeaving status updatedAt"
      );

      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      const outstanding = await outstandingBeforeManualCollection(
        employee,
        parsedDate,
        txn._id
      );

      if (outstanding <= 0) {
        return NextResponse.json(
          { error: "Employee ka koi outstanding loan nahi hai" },
          { status: 400 }
        );
      }

      if (numericAmount > outstanding + 0.009) {
        return NextResponse.json(
          {
            error: `Loan outstanding sirf ₹${outstanding.toFixed(2)} hai`,
          },
          { status: 400 }
        );
      }
    }


    // ------------------------------------------------------------------------
    // AUDIT HISTORY
    // ------------------------------------------------------------------------

    txn.auditHistory.push({
      editedAt: new Date(),
      editedBy: session.user.id,

      oldValue: {
        amount: txn.amount,
        date: txn.date,
        mode: txn.mode,
        remarks: txn.remarks,
      },
    });


    // ------------------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------------------

    txn.amount = numericAmount;
    txn.date = parsedDate;
    txn.mode = mode;
    txn.remarks = cleanRemarks;
    txn.editedBy = session.user.id;
    txn.editedAt = new Date();

    await txn.save();


    // ------------------------------------------------------------------------
    // NOTIFICATION
    // ------------------------------------------------------------------------

    await notifyEmployee({
      employeeId: txn.employee,
      eventKey: `transaction:${txn._id}:updated`,
      title: `${TYPE_LABELS[txn.type] || "Payroll Transaction"} Updated`,
      message:
        `${TYPE_LABELS[txn.type] || txn.type} transaction HR ne update kiya hai. ` +
        `Amount: ₹${Number(txn.amount || 0).toLocaleString("en-IN")}. ` +
        `Remarks: ${txn.remarks}`,
      date: txn.date.toISOString().slice(0, 10),
      href: "/employee/salary",
    });

    return NextResponse.json({
      transaction: txn,
    });
  } catch (err) {
    console.error("PUT /api/transactions error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}