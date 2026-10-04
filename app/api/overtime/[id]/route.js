import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import OvertimeEntry from "@/app/models/OvertimeEntry";
import { computeLeaveBalance } from "@/app/lib/leaveBalance";
import { notifyEmployee } from "@/app/lib/notificationService";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await dbConnect();
    const entry = await OvertimeEntry.findById(id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (entry.settlement === "comp-off") {
      const balance = await computeLeaveBalance(entry.employee);
      if (Number(balance.compOff?.available || 0) < Number(entry.compOffDays || 0)) {
        return NextResponse.json({ error: "Ye C-Off credit already use ho chuka hai, isliye delete nahi kar sakte" }, { status: 400 });
      }
    }
    const deleted = {
      employee: entry.employee,
      date: entry.date,
      settlement: entry.settlement,
      hours: entry.hours,
      amount: entry.amount,
      compOffDays: entry.compOffDays,
      note: entry.note,
    };
    await entry.deleteOne();
    await notifyEmployee({
      employeeId: deleted.employee,
      eventKey: `overtime:${id}:deleted`,
      title: deleted.settlement === "comp-off" ? "C-Off Credit Removed" : "Overtime Entry Removed",
      message: deleted.settlement === "comp-off"
        ? `${deleted.date} ka ${Number(deleted.compOffDays || 0)} day C-Off credit HR ne remove kiya hai.`
        : `${deleted.date} ka ${Number(deleted.hours || 0)} hour(s) overtime pay entry HR ne remove kiya hai.`,
      href: deleted.settlement === "comp-off" ? "/employee/leave" : "/employee/salary",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/overtime/[id] error:", err);
    return NextResponse.json({ error: "Delete nahi ho paya" }, { status: 500 });
  }
}
