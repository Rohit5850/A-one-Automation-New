import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/app/models/User";
import { normalizeEmail, normalizeIndianPhone, toE164Indian } from "@/app/lib/identityValidation";

async function publicUser(user) {
  return {
    id: user._id.toString(), email: user.email, role: user.role,
    employeeId: user.employee ? user.employee.toString() : null,
    mustChangePassword: !!user.mustChangePassword,
  };
}

const providers = [
  CredentialsProvider({
    id: "credentials", name: "Email",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) throw new Error("Login details required");
      await dbConnect();
      const email = normalizeEmail(credentials.email);
      const user = await User.findOne({ email, isActive: true }).select("+passwordHash");
      if (!user) throw new Error("Invalid login details");
      if (user.isLocked) throw new Error("ACCOUNT_LOCKED");
      const valid = user.passwordHash && await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) {
        const attempts = Number(user.failedLoginAttempts || 0) + 1;
        const locked = attempts >= 3;
        await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: attempts, isLocked: locked } });
        throw new Error(locked ? "ACCOUNT_LOCKED" : "Invalid login details");
      }
      if (user.failedLoginAttempts) await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 } });
      return publicUser(user);
    },
  }),
  CredentialsProvider({
    id: "mobile-otp", name: "Mobile OTP",
    credentials: { phone: { label: "Mobile", type: "text" }, code: { label: "OTP", type: "text" } },
    async authorize(credentials) {
      const phone = normalizeIndianPhone(credentials?.phone || "");
      const code = String(credentials?.code || "").trim();
      const e164 = toE164Indian(phone);
      if (!e164 || !/^\d{4,10}$/.test(code)) throw new Error("Invalid mobile or OTP");
      await dbConnect();
      const user = await User.findOne({ phone, isActive: true });
      if (!user) throw new Error("This mobile number is not registered");
      if (user.isLocked) throw new Error("ACCOUNT_LOCKED");
      const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, service = process.env.TWILIO_VERIFY_SERVICE_SID;
      if (!sid || !token || !service) throw new Error("Mobile OTP service is not configured");
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const body = new URLSearchParams({ To: e164, Code: code });
      const verify = await fetch(`https://verify.twilio.com/v2/Services/${service}/VerificationCheck`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
      const result = await verify.json().catch(() => ({}));
      if (!verify.ok || result.status !== "approved") throw new Error("Invalid or expired OTP");
      return publicUser(user);
    },
  }),
];

export const authOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, pages: { signIn: "/login", error: "/login" }, providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.role) { token.role = user.role; token.employeeId = user.employeeId; token.mustChangePassword = !!user.mustChangePassword; }
      if (trigger === "update" && session?.mustChangePassword !== undefined) token.mustChangePassword = !!session.mustChangePassword;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role; session.user.employeeId = token.employeeId; session.user.id = token.sub; session.user.mustChangePassword = !!token.mustChangePassword; return session;
    },
  }, secret: process.env.NEXTAUTH_SECRET,
};
