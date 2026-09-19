import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";
import { authOptions } from "@/app/lib/authOptions";
import User from "@/app/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { currentPassword, newPassword, confirmPassword } = await req.json().catch(() => ({}));
  if (!currentPassword || !newPassword || !confirmPassword) return NextResponse.json({ error: "All password fields required hain" }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "New password aur confirm password match nahi karte" }, { status: 400 });
  if (newPassword === currentPassword) return NextResponse.json({ error: "New password current password se different hona chahiye" }, { status: 400 });
  if (newPassword === "Aone@123") return NextResponse.json({ error: "Default password ko new password nahi rakh sakte" }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ _id: session.user.id, isActive: true }).select("+passwordHash");
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return NextResponse.json({ error: "Current password galat hai" }, { status: 400 });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false; user.failedLoginAttempts = 0; user.isLocked = false;
  user.passwordResetTokenHash = null; user.passwordResetExpiresAt = null;
  await user.save();
  return NextResponse.json({ ok: true });
}
