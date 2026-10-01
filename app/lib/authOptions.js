import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
import User from "@/app/models/User";
import { normalizeEmail, normalizeIndianPhone } from "@/app/lib/identityValidation";
import { assertMsg91PhoneMatches, verifyMsg91AccessToken } from "@/app/lib/msg91";
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
            if (!credentials?.email || !credentials?.password)
                throw new Error("Login details required");
            await dbConnect();
            const email = normalizeEmail(credentials.email);
            const user = await User.findOne({ email, isActive: true }).select("+passwordHash");
            if (!user)
                throw new Error("Invalid login details");
            const now = new Date();
            if (user.role === "hr" && user.lockUntil && new Date(user.lockUntil) > now)
                throw new Error("HR_TEMP_LOCKED");
            if (user.role === "hr" && user.lockUntil && new Date(user.lockUntil) <= now) {
                await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, isLocked: false, lockUntil: null } });
                user.failedLoginAttempts = 0;
                user.isLocked = false;
                user.lockUntil = null;
            }
            if (user.role !== "hr" && user.isLocked)
                throw new Error("ACCOUNT_LOCKED");
            const valid = user.passwordHash && await bcrypt.compare(credentials.password, user.passwordHash);
            if (!valid) {
                const attempts = Number(user.failedLoginAttempts || 0) + 1;
                if (user.role === "hr" && attempts >= 3) {
                    const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
                    await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, isLocked: false, lockUntil } });
                    throw new Error("HR_TEMP_LOCKED");
                }
                const locked = user.role !== "hr" && attempts >= 3;
                await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: attempts, isLocked: locked, lockUntil: null } });
                throw new Error(locked ? "ACCOUNT_LOCKED" : "Invalid login details");
            }
            if (user.failedLoginAttempts || user.lockUntil || user.isLocked)
                await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, isLocked: false, lockUntil: null } });
            return publicUser(user);
        },
    }),
    CredentialsProvider({
        id: "mobile-otp", name: "Mobile OTP",
        credentials: { phone: { label: "Mobile", type: "text" }, accessToken: { label: "MSG91 Access Token", type: "text" } },
        async authorize(credentials) {
            const phone = normalizeIndianPhone(credentials?.phone || "");
            const accessToken = String(credentials?.accessToken || "").trim();
            if (!/^[6-9]\d{9}$/.test(phone) || !accessToken)
                throw new Error("Invalid mobile verification");
            // Do not trust a browser-side OTP success alone. MSG91's one-time access
            // token is verified again from the server and must belong to this phone.
            const verification = await verifyMsg91AccessToken(accessToken);
            assertMsg91PhoneMatches(verification, phone);
            await dbConnect();
            const user = await User.findOne({ phone, isActive: true });
            if (!user)
                throw new Error("This mobile number is not registered");
            if (user.isLocked)
                throw new Error("ACCOUNT_LOCKED");
            return publicUser(user);
        },
    }),
];
export const authOptions = {
    session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, pages: { signIn: "/login", error: "/login" }, providers,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user?.role) {
                token.role = user.role;
                token.employeeId = user.employeeId;
                token.mustChangePassword = !!user.mustChangePassword;
            }
            if (trigger === "update" && session?.mustChangePassword !== undefined)
                token.mustChangePassword = !!session.mustChangePassword;
            return token;
        },
        async session({ session, token }) {
            session.user.role = token.role;
            session.user.employeeId = token.employeeId;
            session.user.id = token.sub;
            session.user.mustChangePassword = !!token.mustChangePassword;
            return session;
        },
    }, secret: process.env.NEXTAUTH_SECRET,
};
