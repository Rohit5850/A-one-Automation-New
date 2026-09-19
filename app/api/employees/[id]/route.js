import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { monthFromDate, todayDateKey } from "@/app/lib/payrollRules";
import { isEmailSyntaxValid, isValidIndianMobile, normalizeEmail, normalizeIndianPhone } from "@/app/lib/identityValidation";

async function requireHR() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return null;
  return session;
}

export async function GET(req, { params }) {
  try {
    const session = await requireHR();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();
    const employee = await Employee.findById(id).select("+salary +basicSalary +hra +otherAllowance").populate("reportingHead", "email role isActive employee");
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (err) {
    console.error("GET /api/employees/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await requireHR();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const incoming = await req.json();
    const allowed = ["title","fullName","email","phone","gender","designation","department","reportingHead","dateOfJoining","dateOfLeaving","wageType","salary","basicSalary","hra","otherAllowance","webAttendanceEnabled","fieldWorker","showLocationToEmployee","address","photoUrl","bloodGroup","emergencyContact","status"];
    const updates = Object.fromEntries(Object.entries(incoming || {}).filter(([key]) => allowed.includes(key)));
    if (updates.reportingHead && typeof updates.reportingHead === "object") updates.reportingHead = updates.reportingHead._id;

    if (Object.prototype.hasOwnProperty.call(updates, "fieldWorker")) {
      updates.fieldWorker = !!updates.fieldWorker;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "showLocationToEmployee")) {
      updates.showLocationToEmployee = !!updates.showLocationToEmployee;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "salary")) {
      const value = updates.salary === "" || updates.salary === null ? 0 : Number(updates.salary);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: "Salary/Rate valid non-negative amount hona chahiye" },
          { status: 400 }
        );
      }
      updates.salary = value;
    }

    await dbConnect();
    const current = await Employee.findById(id).select("+salary +salaryHistory +basicSalary +hra +otherAllowance");
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const linkedUser = await User.findOne({ employee: id });
    if (Object.prototype.hasOwnProperty.call(updates, "email")) {
      updates.email = normalizeEmail(updates.email);
      if (!isEmailSyntaxValid(updates.email)) {
        return NextResponse.json({ error: "Valid email address enter karein" }, { status: 400 });
      }
      const duplicate = await User.findOne({ email: updates.email, _id: { $ne: linkedUser?._id } });
      if (duplicate) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "phone") && !String(updates.phone || "").trim()) {
      delete updates.phone;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "phone")) {
      updates.phone = normalizeIndianPhone(updates.phone);
      if (!isValidIndianMobile(updates.phone)) return NextResponse.json({ error: "Valid 10-digit Indian mobile number enter karein" }, { status: 400 });
      const duplicate = await User.findOne({ phone: updates.phone, _id: { $ne: linkedUser?._id } });
      if (duplicate) return NextResponse.json({ error: "Mobile number already in use" }, { status: 409 });
    }

    const allowedDepartments = ["Automation", "Sales", "Electrical", "HR"];
    const allowedDesignations = ["Manager", "Assistant Manager", "Executive", "Junior", "Trainee"];
    if (updates.title && !["mr", "mrs", "miss"].includes(updates.title)) return NextResponse.json({ error: "Valid title select karein" }, { status: 400 });
    if (updates.department && !allowedDepartments.includes(updates.department)) return NextResponse.json({ error: "Valid department select karein" }, { status: 400 });
    if (updates.designation && !allowedDesignations.includes(updates.designation)) return NextResponse.json({ error: "Valid designation select karein" }, { status: 400 });
    if (Object.prototype.hasOwnProperty.call(updates, "emergencyContact")) {
      updates.emergencyContact = normalizeIndianPhone(updates.emergencyContact);
      if (!isValidIndianMobile(updates.emergencyContact)) return NextResponse.json({ error: "Valid 10-digit emergency contact required hai" }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(updates, "reportingHead")) {
      const head = await User.findOne({ _id: updates.reportingHead, role: "hr", isActive: true });
      if (!head) return NextResponse.json({ error: "Reporting Head active HR account hona chahiye" }, { status: 400 });
    }
    if (updates.wageType === "monthly" || (!updates.wageType && current.wageType === "monthly")) {
      const basic = Number(updates.basicSalary ?? current.basicSalary ?? 0);
      const hra = Number(updates.hra ?? current.hra ?? 0);
      const other = Number(updates.otherAllowance ?? current.otherAllowance ?? 0);
      if (![basic, hra, other].every((v) => Number.isFinite(v) && v >= 0)) return NextResponse.json({ error: "Basic/HRA/Other Allowance negative nahi ho sakte" }, { status: 400 });
      if (["basicSalary", "hra", "otherAllowance"].some((k) => Object.prototype.hasOwnProperty.call(updates, k))) {
        const incomingTotal = basic + hra + other;
        const legacyHasNoBreakup = Number(current.salary || 0) > 0 && Number(current.basicSalary || 0) === 0 && Number(current.hra || 0) === 0 && Number(current.otherAllowance || 0) === 0;
        // Preserve a legacy gross salary until HR actually enters a component breakup.
        if (!(legacyHasNoBreakup && incomingTotal === 0)) {
          updates.basicSalary = basic; updates.hra = hra; updates.otherAllowance = other; updates.salary = incomingTotal;
        } else {
          delete updates.basicSalary; delete updates.hra; delete updates.otherAllowance; delete updates.salary;
        }
      }
    }

    const finalJoinDate = Object.prototype.hasOwnProperty.call(updates, "dateOfJoining")
      ? updates.dateOfJoining
      : current.dateOfJoining;
    const finalLeaveDate = Object.prototype.hasOwnProperty.call(updates, "dateOfLeaving")
      ? updates.dateOfLeaving
      : current.dateOfLeaving;
    if (finalJoinDate && finalLeaveDate && new Date(finalLeaveDate) < new Date(finalJoinDate)) {
      return NextResponse.json(
        { error: "Date of Leaving joining date se pehle nahi ho sakti" },
        { status: 400 }
      );
    }

    const salaryChanged =
      Object.prototype.hasOwnProperty.call(updates, "salary") &&
      Number(updates.salary ?? 0) !== Number(current.salary ?? 0);
    const wageChanged =
      Object.prototype.hasOwnProperty.call(updates, "wageType") && updates.wageType !== current.wageType;

    if (salaryChanged || wageChanged) {
      const history = Array.isArray(current.salaryHistory)
        ? current.salaryHistory.map((item) => ({
            amount: Number(item.amount || 0),
            basicSalary: Number(item.basicSalary || 0),
            hra: Number(item.hra || 0),
            otherAllowance: Number(item.otherAllowance || 0),
            wageType: item.wageType,
            effectiveMonth: item.effectiveMonth,
            changedAt: item.changedAt,
          }))
        : [];

      // Legacy employees may not have history yet. Preserve their old rate from
      // joining month before applying the new current-month revision.
      if (history.length === 0 && current.salary !== undefined && current.salary !== null) {
        history.push({
          amount: Number(current.salary || 0),
          basicSalary: Number(current.basicSalary || 0),
          hra: Number(current.hra || 0),
          otherAllowance: Number(current.otherAllowance || 0),
          wageType: current.wageType,
          effectiveMonth:
            monthFromDate(current.dateOfJoining) ||
            monthFromDate(current.createdAt) ||
            todayDateKey().slice(0, 7),
          changedAt: current.createdAt || new Date(),
        });
      }

      const effectiveMonth = todayDateKey().slice(0, 7);
      const newAmount = Object.prototype.hasOwnProperty.call(updates, "salary")
        ? Number(updates.salary ?? 0)
        : Number(current.salary || 0);
      const newWageType = updates.wageType || current.wageType;

      const sameMonthIndex = history.findIndex((item) => item.effectiveMonth === effectiveMonth);
      const revision = {
        amount: newAmount,
        basicSalary: Number(updates.basicSalary ?? current.basicSalary ?? 0),
        hra: Number(updates.hra ?? current.hra ?? 0),
        otherAllowance: Number(updates.otherAllowance ?? current.otherAllowance ?? 0),
        wageType: newWageType,
        effectiveMonth,
        changedAt: new Date(),
      };
      if (sameMonthIndex >= 0) history[sameMonthIndex] = revision;
      else history.push(revision);
      history.sort((a, b) => a.effectiveMonth.localeCompare(b.effectiveMonth));
      updates.salaryHistory = history;
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("+salary +basicSalary +hra +otherAllowance");

    if (linkedUser) {
      const userUpdates = {};
      if (updates.email) userUpdates.email = updates.email;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (Object.keys(userUpdates).length) await User.updateOne({ _id: linkedUser._id }, { $set: userUpdates });
    }

    return NextResponse.json({ employee });
  } catch (err) {
    console.error("PUT /api/employees/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await requireHR();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();

    const existing = await Employee.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const leavingDate =
      existing.dateOfLeaving || new Date(`${todayDateKey()}T00:00:00.000Z`);
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: { status: "inactive", dateOfLeaving: leavingDate } },
      { new: true }
    );

    await User.updateOne({ employee: id }, { $set: { isActive: false } });

    return NextResponse.json({ success: true, employee });
  } catch (err) {
    console.error("DELETE /api/employees/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
