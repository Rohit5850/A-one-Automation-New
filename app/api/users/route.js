import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import Employee from "@/app/models/Employee"; // needed for populate() to resolve

// GET /api/users -> HR only: list all login accounts (HR + employee)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find()
      .populate("employee", "fullName employeeId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
