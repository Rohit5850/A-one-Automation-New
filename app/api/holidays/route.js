import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Holiday from "@/app/models/Holiday";

// GET /api/holidays -> everyone logged in can view (needed to show holidays on attendance pages)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const holidays = await Holiday.find().sort({ date: 1 });
    return NextResponse.json({ holidays });
  } catch (err) {
    console.error("GET /api/holidays error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/holidays -> HR only: add a holiday. Body: { date: "YYYY-MM-DD", name }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body.date || !body.name) {
      return NextResponse.json({ error: "date and name are required" }, { status: 400 });
    }

    await dbConnect();
    const holiday = await Holiday.findOneAndUpdate(
      { date: body.date },
      { $set: { name: body.name } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ holiday }, { status: 201 });
  } catch (err) {
    console.error("POST /api/holidays error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
