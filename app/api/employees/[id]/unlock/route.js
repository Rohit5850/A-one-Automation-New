import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";

const DEFAULT_PASSWORD = "Aone@123";
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params; await dbConnect();
  const employee = await Employee.findById(id).select("_id status");
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  const user = await User.findOne({ employee: employee._id, role: "employee" }).select("+passwordHash");
  if (!user) return NextResponse.json({ error: "Employee login account not found" }, { status: 404 });
  user.passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12); user.failedLoginAttempts = 0; user.isLocked = false; user.mustChangePassword = true; user.passwordResetTokenHash = null; user.passwordResetExpiresAt = null;
  await user.save();
  return NextResponse.json({ ok: true, initialPassword: DEFAULT_PASSWORD });
}
