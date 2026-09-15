import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import PaymentRequest from "@/app/models/PaymentRequest";
import Loan from "@/app/models/Loan";
import Transaction from "@/app/models/Transaction";
import Employee from "@/app/models/Employee";
import { validateLoanTerms, todayDateKey } from "@/app/lib/payrollRules";

function currentMonthStr() {
  return todayDateKey().slice(0, 7);
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, reviewNote } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    await dbConnect();
    const request = await PaymentRequest.findById(id);
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.status !== "pending") {
      return NextResponse.json({ error: "Ye request already review ho chuki hai" }, { status: 400 });
    }

    if (status === "approved") {
      const employee = await Employee.findById(request.employee).select("status");
      if (!employee || employee.status !== "active") {
        return NextResponse.json(
          { error: "Inactive employee ki payment request approve nahi ki ja sakti" },
          { status: 400 }
        );
      }
      if (request.type === "loan") {
        const termError = validateLoanTerms(request.amount, request.monthlyDeduction, request.totalMonths);
        if (termError) return NextResponse.json({ error: termError }, { status: 400 });
      }
    }

    request.status = status;
    request.reviewNote = reviewNote;
    request.reviewedBy = session.user.id;
    await request.save();

    if (status === "approved") {
      if (request.type === "loan") {
        await Loan.create({
          employee: request.employee,
          amount: request.amount,
          monthlyDeduction: request.monthlyDeduction,
          totalMonths: request.totalMonths,
          startMonth: currentMonthStr(),
          remarks: request.note || "Employee-requested loan",
        });
      } else if (request.type === "advance") {
        await Transaction.create({
          employee: request.employee,
          type: "advance",
          amount: request.amount,
          date: new Date(),
          mode: "cash",
          remarks: request.note || "Employee-requested advance",
          createdBy: session.user.id,
        });
      }
    }

    return NextResponse.json({ request });
  } catch (err) {
    console.error("PATCH /api/payment-requests/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
