import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { monthFromDate, todayDateKey } from "@/app/lib/payrollRules";
import { hasMailDomain, isEmailSyntaxValid, isValidIndianMobile, isValidUsername, normalizeEmail, normalizeIndianPhone, normalizeUsername } from "@/app/lib/identityValidation";

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
    username,
    email,
    phone,
    gender,
    designation,
    department,
    dateOfJoining,
    dateOfLeaving,
    wageType, // "daily" | "monthly" - required, decides how salary auto-calculates from attendance
    salary, // monthly amount if wageType=monthly, per-day rate if wageType=daily
    fieldWorker,
    address,
    photoUrl,
    bloodGroup,
    emergencyContact,
    password, // initial login password set by HR; employee should change later
  } = body;

  if (!employeeId || !fullName || !username || !email || !phone || !password) {
    return NextResponse.json({ error: "Employee ID, name, username, email, mobile aur password required hain" }, { status: 400 });
  }
  const cleanEmail = normalizeEmail(email);
  const cleanUsername = normalizeUsername(username);
  const cleanPhone = normalizeIndianPhone(phone);
  if (!isValidUsername(cleanUsername)) {
    return NextResponse.json({ error: "Username 4-30 characters ka ho aur sirf letters, numbers, dot, underscore ya hyphen use karein" }, { status: 400 });
  }
  if (!isEmailSyntaxValid(cleanEmail)) {
    return NextResponse.json({ error: "Valid email address enter karein" }, { status: 400 });
  }
  if (!(await hasMailDomain(cleanEmail))) {
    return NextResponse.json({ error: "Email domain valid/mail-enabled nahi hai" }, { status: 400 });
  }
  if (!isValidIndianMobile(cleanPhone)) {
    return NextResponse.json({ error: "Valid 10-digit Indian mobile number enter karein (6-9 se start)" }, { status: 400 });
  }
  if (!wageType || !["daily", "monthly"].includes(wageType)) {
    return NextResponse.json(
      { error: "Wage type (daily/monthly) is required" },
      { status: 400 }
    );
  }
  const salaryNumber = salary === "" || salary === null || salary === undefined ? undefined : Number(salary);
  if (salaryNumber !== undefined && (!Number.isFinite(salaryNumber) || salaryNumber < 0)) {
    return NextResponse.json({ error: "Salary/Rate valid non-negative amount hona chahiye" }, { status: 400 });
  }
  if (dateOfJoining && dateOfLeaving && new Date(dateOfLeaving) < new Date(dateOfJoining)) {
    return NextResponse.json({ error: "Date of Leaving joining date se pehle nahi ho sakti" }, { status: 400 });
  }

  await dbConnect();

  const existingUser = await User.findOne({
    $or: [{ email: cleanEmail }, { username: cleanUsername }, { phone: cleanPhone }],
  });
  if (existingUser) {
    const field = existingUser.email === cleanEmail ? "Email" : existingUser.username === cleanUsername ? "Username" : "Mobile number";
    return NextResponse.json({ error: `${field} already in use` }, { status: 409 });
  }

  try {
    const employee = await Employee.create({
      employeeId,
      fullName,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      gender: gender || undefined,
      designation,
      department,
      dateOfJoining,
      dateOfLeaving: dateOfLeaving || null,
      wageType,
      salary: salaryNumber,
      salaryHistory:
        salaryNumber !== undefined
          ? [
              {
                amount: salaryNumber,
                wageType,
                effectiveMonth: monthFromDate(dateOfJoining) || todayDateKey().slice(0, 7),
              },
            ]
          : [],
      fieldWorker: !!fieldWorker,
      address,
      photoUrl,
      bloodGroup,
      emergencyContact,
      createdBy: session.user.id,
    });

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      email: cleanEmail,
      username: cleanUsername,
      phone: cleanPhone,
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
