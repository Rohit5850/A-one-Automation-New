import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";

// GET /api/employees -> HR only: list all employee cards, or ?employeeId=EMP-0001 to find one
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (employeeId) {
    const employee = await Employee.findOne({ employeeId: employeeId.trim() });
    return NextResponse.json({ employees: employee ? [employee] : [] });
  }

  const employees = await Employee.find().sort({ createdAt: -1 });
  return NextResponse.json({ employees });
}

// POST /api/employees -> HR only: create employee card + login account
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    employeeId,
    fullName,
    email,
    phone,
    designation,
    department,
    dateOfJoining,
    address,
    photoUrl,
    bloodGroup,
    emergencyContact,
    password, // initial login password set by HR; employee should change later
  } = body;

  if (!employeeId || !fullName || !email || !password) {
    return NextResponse.json(
      { error: "employeeId, fullName, email and password are required" },
      { status: 400 }
    );
  }

  await dbConnect();

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  try {
    const employee = await Employee.create({
      employeeId,
      fullName,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      address,
      photoUrl,
      bloodGroup,
      emergencyContact,
      createdBy: session.user.id,
    });

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "employee",
      employee: employee._id,
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Employee ID or email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
