import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";

async function requireHR() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return null;
  return session;
}

export async function GET(req, { params }) {
  try {
    const session = await requireHR();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params; // Next.js 15+/16: route params are async
    await dbConnect();
    const employee = await Employee.findById(id);
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
    delete updates.employeeId; // don't allow ID reassignment via this route
    delete updates._id;

    await dbConnect();

    // IMPORTANT: wrap in $set. Passing the plain object directly to
    // findByIdAndUpdate makes MongoDB REPLACE the whole document, silently
    // deleting any field not present in `updates` (employeeId, status, etc).
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (err) {
    console.error("PUT /api/employees/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE -> SOFT delete only. Employee record and ALL attendance history stay in
// MongoDB forever (5-year retention requirement). We just mark the employee
// "inactive" so they disappear from the active list, and disable their login.
export async function DELETE(req, { params }) {
  try {
    const session = await requireHR();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: { status: "inactive" } },
      { new: true }
    );
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await User.updateOne({ employee: id }, { $set: { isActive: false } });

    return NextResponse.json({ success: true, employee });
  } catch (err) {
    console.error("DELETE /api/employees/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
