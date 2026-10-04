import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import PaymentRequest from "@/app/models/PaymentRequest";
import Employee from "@/app/models/Employee";
import { validateLoanTerms } from "@/app/lib/payrollRules";
import { notifyActiveHr } from "@/app/lib/notificationService";

// GET /api/payment-requests
//   - employee: own requests only
//   - hr: all requests, optional ?status= filter
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    let filter = {};

    if (session.user.role === "employee") {
      filter.employee = session.user.employeeId;
    } else if (session.user.role === "hr") {
      const status = searchParams.get("status");
      if (status) filter.status = status;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requests = await PaymentRequest.find(filter)
      .populate("employee", "fullName employeeId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/payment-requests error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/payment-requests -> employee applies for a loan or advance (self only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { type, amount, monthlyDeduction, totalMonths, note } = body;

    if (!type || !["loan", "advance"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }
    if (type === "loan") {
      if (!monthlyDeduction || !totalMonths) {
        return NextResponse.json(
          { error: "Loan ke liye monthly deduction aur total months zaroori hain" },
          { status: 400 }
        );
      }
      const termError = validateLoanTerms(amount, monthlyDeduction, Number(totalMonths));
      if (termError) return NextResponse.json({ error: termError }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findById(session.user.employeeId).select("status");
    if (!employee || employee.status !== "active") {
      return NextResponse.json({ error: "Inactive employee payment request submit nahi kar sakta" }, { status: 400 });
    }
    const existingPending = await PaymentRequest.findOne({
      employee: session.user.employeeId,
      type,
      status: "pending",
    });
    if (existingPending) {
      return NextResponse.json(
        { error: `Aapki ${type} ki ek request already pending hai` },
        { status: 400 }
      );
    }

    const request = await PaymentRequest.create({
      employee: session.user.employeeId,
      type,
      amount: Number(amount),
      monthlyDeduction: type === "loan" ? Number(monthlyDeduction) : undefined,
      totalMonths: type === "loan" ? Number(totalMonths) : undefined,
      note,
    });

    const typeLabel = type === "loan" ? "Loan" : "Advance";
    await notifyActiveHr({
      employeeId: session.user.employeeId,
      eventKey: `payment-submitted:${request._id}`,
      title: `New ${typeLabel} Request`,
      message: `${typeLabel} request ₹${Number(amount).toLocaleString("en-IN")} approval ke liye submit hui hai.`,
      href: "/hr/payment-requests",
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("POST /api/payment-requests error:", err);
    return NextResponse.json({ error: "Could not submit request" }, { status: 500 });
  }
}
