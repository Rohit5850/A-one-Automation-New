import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { monthFromDate, todayDateKey } from "@/app/lib/payrollRules";
import { isEmailSyntaxValid, isValidIndianMobile, normalizeEmail, normalizeIndianPhone } from "@/app/lib/identityValidation";

const DEPARTMENTS = ["Automation", "Sales", "Electrical", "HR"];
const DESIGNATIONS = ["Manager", "Assistant Manager", "Executive", "Junior", "Trainee"];
const TITLES = ["mr", "mrs", "miss"];
const DEFAULT_PASSWORD = "Aone@123";

function money(value, field) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} negative nahi ho sakta`);
  return n;
}

async function nextEmployeeId() {
  const rows = await Employee.find({ employeeId: /^AONE\/EMP\/\d+$/i }).select("employeeId").lean();
  let max = 0;
  for (const row of rows) {
    const match = String(row.employeeId || "").match(/^AONE\/EMP\/(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `AONE/EMP/${String(max + 1).padStart(3, "0")}`;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  if (employeeId) {
    const employee = await Employee.findOne({ employeeId: employeeId.trim() }).populate("reportingHead", "email role isActive employee");
    return NextResponse.json({ employees: employee ? [employee] : [] });
  }
  const employees = await Employee.find().populate("reportingHead", "email role isActive employee").sort({ createdAt: -1 });
  return NextResponse.json({ employees });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const cleanEmail = normalizeEmail(body.email);
  const cleanPhone = normalizeIndianPhone(body.phone);
  const cleanEmergency = normalizeIndianPhone(body.emergencyContact);
  const fullName = String(body.fullName || "").trim();
  const wageType = body.wageType;

  if (!fullName || !cleanEmail || !cleanPhone || !cleanEmergency || !body.department || !body.designation || !body.reportingHead || !wageType) {
    return NextResponse.json({ error: "Name, email, mobile, emergency contact, department, designation, reporting head aur wage type required hain" }, { status: 400 });
  }
  if (body.title && !TITLES.includes(body.title)) return NextResponse.json({ error: "Valid title select karein" }, { status: 400 });
  if (!isEmailSyntaxValid(cleanEmail)) return NextResponse.json({ error: "Valid email address enter karein" }, { status: 400 });
  if (!isValidIndianMobile(cleanPhone)) return NextResponse.json({ error: "Mobile number +91 ke baad valid 10-digit Indian number hona chahiye" }, { status: 400 });
  if (!isValidIndianMobile(cleanEmergency)) return NextResponse.json({ error: "Emergency contact +91 ke baad valid 10-digit Indian number hona chahiye" }, { status: 400 });
  if (!DEPARTMENTS.includes(body.department)) return NextResponse.json({ error: "Valid department select karein" }, { status: 400 });
  if (!DESIGNATIONS.includes(body.designation)) return NextResponse.json({ error: "Valid designation select karein" }, { status: 400 });
  if (!['daily','monthly'].includes(wageType)) return NextResponse.json({ error: "Valid wage type select karein" }, { status: 400 });
  if (body.dateOfJoining && body.dateOfLeaving && new Date(body.dateOfLeaving) < new Date(body.dateOfJoining)) return NextResponse.json({ error: "Date of Leaving joining date se pehle nahi ho sakti" }, { status: 400 });

  let salaryNumber, basicSalary = 0, hra = 0, otherAllowance = 0;
  try {
    if (wageType === 'monthly') {
      basicSalary = money(body.basicSalary, 'Basic Salary');
      hra = money(body.hra, 'HRA');
      otherAllowance = money(body.otherAllowance, 'Other Allowance');
      salaryNumber = basicSalary + hra + otherAllowance;
    } else {
      salaryNumber = money(body.salary, 'Per-day Rate');
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  await dbConnect();
  const reportingHead = await User.findOne({ _id: body.reportingHead, role: 'hr', isActive: true });
  if (!reportingHead) return NextResponse.json({ error: "Reporting Head active HR account hona chahiye" }, { status: 400 });
  const duplicate = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
  if (duplicate) return NextResponse.json({ error: duplicate.email === cleanEmail ? "Email already in use" : "Mobile number already in use" }, { status: 409 });

  let employee = null;
  try {
    // Retry protects the auto-number against a simultaneous employee creation.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const employeeId = await nextEmployeeId();
      try {
        employee = await Employee.create({
          employeeId,
          title: body.title || null,
          fullName,
          email: cleanEmail,
          phone: cleanPhone,
          gender: body.gender || undefined,
          designation: body.designation,
          department: body.department,
          reportingHead: body.reportingHead,
          dateOfJoining: body.dateOfJoining || null,
          dateOfLeaving: body.dateOfLeaving || null,
          wageType,
          salary: salaryNumber,
          basicSalary,
          hra,
          otherAllowance,
          salaryHistory: [{ amount: salaryNumber, basicSalary, hra, otherAllowance, wageType, effectiveMonth: monthFromDate(body.dateOfJoining) || todayDateKey().slice(0, 7) }],
          webAttendanceEnabled: true,
          fieldWorker: true,
          address: body.address,
          photoUrl: body.photoUrl,
          bloodGroup: body.bloodGroup,
          emergencyContact: cleanEmergency,
          createdBy: session.user.id,
        });
        break;
      } catch (err) {
        if (err?.code !== 11000 || attempt === 4) throw err;
      }
    }
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    await User.create({ email: cleanEmail, phone: cleanPhone, passwordHash, role: "employee", employee: employee._id, mustChangePassword: true, failedLoginAttempts: 0, isLocked: false });
    return NextResponse.json({ employee, initialPassword: DEFAULT_PASSWORD }, { status: 201 });
  } catch (err) {
    if (employee?._id) await Employee.deleteOne({ _id: employee._id }).catch(() => {});
    if (err?.code === 11000) return NextResponse.json({ error: "Employee ID, email ya mobile already exists" }, { status: 409 });
    console.error("POST /api/employees error:", err);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
