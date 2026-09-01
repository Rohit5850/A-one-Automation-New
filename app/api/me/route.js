import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Employee from "@/app/models/Employee";

// GET /api/me -> employee's own details only.
// The employeeId comes from the SERVER-SIDE session token, never from client input,
// so there is no way for one employee to fetch another employee's data.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const employee = await Employee.findById(session.user.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ employee });
}
