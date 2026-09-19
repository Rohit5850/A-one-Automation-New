import { NextResponse } from "next/server";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import { normalizeEmail, isEmailSyntaxValid } from "@/app/lib/identityValidation";

function transporter() {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT || 587), secure: String(process.env.SMTP_SECURE || "false") === "true", auth: { user, pass } });
}

export async function POST(req) {
  const { email: raw } = await req.json().catch(() => ({}));
  const email = normalizeEmail(raw);
  if (!isEmailSyntaxValid(email)) return NextResponse.json({ error: "Valid registered email enter karein" }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ email, isActive: true });
  // Same response for registered/unregistered email prevents account discovery.
  if (!user) return NextResponse.json({ ok: true, message: "Agar email registered hai to reset link send ho jayega." });
  const mailer = transporter();
  if (!mailer) return NextResponse.json({ error: "Email reset service server par configure nahi hai" }, { status: 503 });
  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();
  const base = (process.env.NEXTAUTH_URL || new URL(req.url).origin).replace(/\/$/, "");
  const link = `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
  try {
    await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: "A-One Automation - Reset Password", text: `A-One Automation password reset link:\n${link}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.` });
  } catch (err) {
    user.passwordResetTokenHash = null; user.passwordResetExpiresAt = null; await user.save();
    console.error("forgot password email error", err);
    return NextResponse.json({ error: "Reset email send nahi ho paya" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: "Agar email registered hai to reset link send ho jayega." });
}
