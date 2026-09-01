import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";

// DELETE /api/attendance/[id] -> HR only. Used by the "Reset" button on the
// Mark Attendance page to undo a wrongly-entered check-in/check-out for a
// specific day. This removes ONLY that one day's record so the employee can
// be checked in again cleanly - it does not touch any other day's history.
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params; // Next.js 15+/16: route params are async
    await dbConnect();

    const record = await Attendance.findByIdAndDelete(id);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/attendance/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
