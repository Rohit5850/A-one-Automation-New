import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Holiday from "@/app/models/Holiday";

// DELETE /api/holidays/[id] -> HR only
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/holidays/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
