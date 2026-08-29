import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// GET /api/attendance
//   - employee: returns ONLY their own history (employeeId taken from session, ignored if sent in query)
//   - hr: can pass ?employeeId=<id> to view a specific employee's history, or omit for all records
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const { searchParams } = new URL(req.url);

  let filter = {};
  if (session.user.role === "employee") {
    filter.employee = session.user.employeeId; // hard-locked to own record
  } else if (session.user.role === "hr") {
    const queryEmployeeId = searchParams.get("employeeId");
    if (queryEmployeeId) filter.employee = queryEmployeeId;
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const records = await Attendance.find(filter).sort({ date: -1 }).limit(365);
  return NextResponse.json({ records });
}

// POST /api/attendance -> employee marks today's attendance (check-in).
// Employee identity comes from the session ONLY - request body cannot override it.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const date = todayStr();

  await dbConnect();

  try {
    const record = await Attendance.findOneAndUpdate(
      { employee: session.user.employeeId, date },
      {
        $setOnInsert: {
          employee: session.user.employeeId,
          date,
          checkIn: new Date(),
          status: body.status || "present",
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Could not mark attendance" }, { status: 500 });
  }
}

// PATCH /api/attendance -> employee marks check-out for today
export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const record = await Attendance.findOneAndUpdate(
    { employee: session.user.employeeId, date: todayStr() },
    { checkOut: new Date() },
    { new: true }
  );

  if (!record) {
    return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
  }
  return NextResponse.json({ record });
}
