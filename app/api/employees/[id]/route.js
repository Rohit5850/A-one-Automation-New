import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { monthFromDate, todayDateKey } from "@/app/lib/payrollRules";

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
    const employee = await Employee.findById(id).select("+salary");
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
    const updates = await req.json();
    delete updates.employeeId;
    delete updates._id;
    delete updates.salaryHistory;

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
    const current = await Employee.findById(id).select("+salary +salaryHistory");
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    ).select("+salary");

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
