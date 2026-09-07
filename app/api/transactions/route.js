import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Transaction from "@/app/models/Transaction";

// GET /api/transactions?employeeId=...&month=YYYY-MM&type=salary -> HR only
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month"); // "YYYY-MM"
    const type = searchParams.get("type");

    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (type && type !== "all") filter.type = type;
    if (month) {
      const start = new Date(`${month}-01T00:00:00`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/transactions -> HR only.
// Body: { employeeId, type: "salary"|"bonus"|"advance"|"loan-collect", amount, date, mode: "cash"|"online", remarks }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { employeeId, type, amount, date, mode, remarks } = body;

    if (!employeeId || !type || !amount || !date || !mode || !remarks) {
      return NextResponse.json(
        { error: "employeeId, type, amount, date, mode aur remarks sab required hain" },
        { status: 400 }
      );
    }

    await dbConnect();
    const transaction = await Transaction.create({
      employee: employeeId,
      type,
      amount,
      date: new Date(date),
      mode,
      remarks,
      createdBy: session.user.id,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
