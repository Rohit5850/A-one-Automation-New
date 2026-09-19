import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";

export async function POST(req) {
  const { token, newPassword, confirmPassword } = await req.json().catch(() => ({}));
  if (!token || !newPassword || !confirmPassword) return NextResponse.json({ error: "Reset token aur password required hain" }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Password confirmation match nahi karti" }, { status: 400 });
  if (newPassword === "Aone@123") return NextResponse.json({ error: "Default password ko new password nahi rakh sakte" }, { status: 400 });
  const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
  await dbConnect();
  const user = await User.findOne({ passwordResetTokenHash: hash, passwordResetExpiresAt: { $gt: new Date() }, isActive: true }).select("+passwordResetTokenHash +passwordResetExpiresAt +passwordHash");
  if (!user) return NextResponse.json({ error: "Reset link invalid ya expire ho chuka hai" }, { status: 400 });
  user.passwordHash = await bcrypt.hash(newPassword, 12); user.mustChangePassword = false; user.failedLoginAttempts = 0; user.isLocked = false; user.passwordResetTokenHash = null; user.passwordResetExpiresAt = null;
  await user.save();
  return NextResponse.json({ ok: true });
}
