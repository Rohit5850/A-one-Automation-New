import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import PaymentRequest from "@/app/models/PaymentRequest";

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
    if (type === "loan" && (!monthlyDeduction || !totalMonths)) {
      return NextResponse.json(
        { error: "Loan ke liye monthly deduction aur total months zaroori hain" },
        { status: 400 }
      );
    }

    await dbConnect();
    const request = await PaymentRequest.create({
      employee: session.user.employeeId,
      type,
      amount: Number(amount),
      monthlyDeduction: type === "loan" ? Number(monthlyDeduction) : undefined,
      totalMonths: type === "loan" ? Number(totalMonths) : undefined,
      note,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("POST /api/payment-requests error:", err);
    return NextResponse.json({ error: "Could not submit request" }, { status: 500 });
  }
}
