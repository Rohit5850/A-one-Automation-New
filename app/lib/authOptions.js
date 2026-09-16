import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/app/models/User";
import { normalizeEmail, normalizeIndianPhone, normalizeUsername, toE164Indian } from "@/app/lib/identityValidation";

async function publicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    employeeId: user.employee ? user.employee.toString() : null,
  };
}

const providers = [
  CredentialsProvider({
    id: "credentials",
    name: "Email or Username",
    credentials: {
      identifier: { label: "Email or Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.identifier || !credentials?.password) throw new Error("Login details required");
      await dbConnect();
      const raw = String(credentials.identifier).trim();
      const query = raw.includes("@")
        ? { email: normalizeEmail(raw) }
        : { username: normalizeUsername(raw) };
      const user = await User.findOne({ ...query, isActive: true }).select("+passwordHash");
      if (!user || !user.passwordHash || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
        throw new Error("Invalid login details");
      }
      return publicUser(user);
    },
  }),
  CredentialsProvider({
    id: "mobile-otp",
    name: "Mobile OTP",
    credentials: {
      phone: { label: "Mobile", type: "text" },
      code: { label: "OTP", type: "text" },
    },
    async authorize(credentials) {
      const phone = normalizeIndianPhone(credentials?.phone || "");
      const code = String(credentials?.code || "").trim();
      const e164 = toE164Indian(phone);
      if (!e164 || !/^\d{4,10}$/.test(code)) throw new Error("Invalid mobile or OTP");
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const service = process.env.TWILIO_VERIFY_SERVICE_SID;
      if (!sid || !token || !service) throw new Error("Mobile OTP service is not configured");
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const body = new URLSearchParams({ To: e164, Code: code });
      const verify = await fetch(`https://verify.twilio.com/v2/Services/${service}/VerificationCheck`, {
        method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body,
      });
      const result = await verify.json().catch(() => ({}));
      if (!verify.ok || result.status !== "approved") throw new Error("Invalid or expired OTP");
      await dbConnect();
      const user = await User.findOne({ phone, isActive: true });
      if (!user) throw new Error("This mobile number is not registered");
      return publicUser(user);
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
  providers.push(AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
  }));
}

export const authOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!["google", "azure-ad"].includes(account?.provider)) return true;
      await dbConnect();
      const registered = await User.findOne({ email: normalizeEmail(user?.email), isActive: true });
      return !!registered;
    },
    async jwt({ token, user, account }) {
      if (user?.role) {
        token.role = user.role;
        token.employeeId = user.employeeId;
      } else if (["google", "azure-ad"].includes(account?.provider) && token.email) {
        await dbConnect();
        const registered = await User.findOne({ email: normalizeEmail(token.email), isActive: true });
        if (registered) {
          token.role = registered.role;
          token.employeeId = registered.employee ? registered.employee.toString() : null;
          token.sub = registered._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.employeeId = token.employeeId;
      session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
