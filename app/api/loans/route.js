import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Loan from "@/app/models/Loan";

// GET /api/loans?employeeId=... -> HR only
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const filter = employeeId ? { employee: employeeId } : {};
    const loans = await Loan.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ loans });
  } catch (err) {
    console.error("GET /api/loans error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/loans -> HR only. Body: { employeeId, amount, monthlyDeduction, totalMonths, startMonth, remarks }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { employeeId, amount, monthlyDeduction, totalMonths, startMonth, remarks } = body;

    if (!employeeId || !amount || !monthlyDeduction || !totalMonths || !startMonth) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const loan = await Loan.create({
      employee: employeeId,
      amount,
      monthlyDeduction,
      totalMonths,
      startMonth,
      remarks,
    });

    return NextResponse.json({ loan }, { status: 201 });
  } catch (err) {
    console.error("POST /api/loans error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
