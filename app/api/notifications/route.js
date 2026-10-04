import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Notification from "@/app/models/Notification";
import { todayDateKey } from "@/app/lib/payrollRules";

function notificationFilterForSession(session) {
  if (!session?.user?.id) return null;

  if (session.user.role === "hr") {
    return { recipientUser: session.user.id };
  }

  if (session.user.role === "employee" && session.user.employeeId) {
    return {
      $or: [
        { recipientUser: session.user.id },
        // Backward compatibility for older employee-only notifications.
        {
          employee: session.user.employeeId,
          $or: [
            { recipientUser: null },
            { recipientUser: { $exists: false } },
          ],
        },
      ],
    };
  }

  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const filter = notificationFilterForSession(session);
    if (!filter) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ $and: [filter, { isRead: false }] }),
    ]);

    let activeLateMessage = null;
    if (session.user.role === "employee" && session.user.employeeId) {
      const month = todayDateKey().slice(0, 7);
      const latestLate = await Notification.findOne({
        employee: session.user.employeeId,
        type: "late-arrival",
        month,
      }).sort({ createdAt: -1 });
      activeLateMessage = latestLate?.message || null;
    }

    return NextResponse.json({
      notifications,
      unreadCount,
      activeLateMessage,
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Notifications load nahi ho payi" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const baseFilter = notificationFilterForSession(session);
    if (!baseFilter) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    await dbConnect();

    if (body.all === true) {
      await Notification.updateMany(
        { $and: [baseFilter, { isRead: false }] },
        { $set: { isRead: true } }
      );
    } else if (body.id) {
      await Notification.updateOne(
        { $and: [baseFilter, { _id: body.id }] },
        { $set: { isRead: true } }
      );
    } else {
      return NextResponse.json({ error: "Notification id required" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Notification update nahi ho payi" }, { status: 500 });
  }
}
