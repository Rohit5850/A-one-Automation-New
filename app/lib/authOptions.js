import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./dbConnect";
// import User from "@/models/User";
import User from "@/app/models/User"

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hour session, tune as needed
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
          isActive: true,
        }).select("+passwordHash");

        if (!user) {
          // Same error for missing user / wrong password -> avoid leaking which emails exist
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          employeeId: user.employee ? user.employee.toString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Runs on sign-in: attach role + employeeId to the token
      if (user) {
        token.role = user.role;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role + employeeId to the client session (used for UI gating only,
      // NEVER as the source of truth for API authorization)
      session.user.role = token.role;
      session.user.employeeId = token.employeeId;
      session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
