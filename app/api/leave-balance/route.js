import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { computeLeaveBalance } from "@/app/lib/leaveBalance";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let employeeId;
    if (session.user.role === "employee") {
      employeeId = session.user.employeeId;
    } else if (session.user.role === "hr") {
      const { searchParams } = new URL(req.url);
      employeeId = searchParams.get("employeeId");
      if (!employeeId) {
        return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const balance = await computeLeaveBalance(employeeId);
    return NextResponse.json({ balance });
  } catch (err) {
    console.error("GET /api/leave-balance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
