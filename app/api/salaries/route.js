import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";

// GET /api/salaries -> HR only: list all employees with their salary included.
// The Employee schema hides `salary` by default (select: false) for safety -
// we explicitly opt back in here since this endpoint's whole purpose is salary data.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const employees = await Employee.find({ status: "active" })
      .select("employeeId fullName department designation salary wageType status")
      .sort({ fullName: 1 });

    return NextResponse.json({ employees });
  } catch (err) {
    console.error("GET /api/salaries error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
