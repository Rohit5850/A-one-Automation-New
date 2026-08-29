import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import User from "@/models/User";

async function requireHR() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return null;
  return session;
}

export async function GET(req, { params }) {
  const session = await requireHR();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const employee = await Employee.findById(params.id);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ employee });
}

export async function PUT(req, { params }) {
  const session = await requireHR();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates = await req.json();
  delete updates.employeeId; // don't allow ID reassignment via this route
  delete updates._id;

  await dbConnect();
  const employee = await Employee.findByIdAndUpdate(params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ employee });
}

export async function DELETE(req, { params }) {
  const session = await requireHR();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const employee = await Employee.findByIdAndDelete(params.id);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Also deactivate their login account rather than hard-deleting auth history
  await User.updateOne({ employee: params.id }, { isActive: false });

  return NextResponse.json({ success: true });
}
