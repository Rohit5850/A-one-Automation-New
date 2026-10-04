import Notification from "@/app/models/Notification";
import Employee from "@/app/models/Employee";
import User from "@/app/models/User";
import { todayDateKey } from "@/app/lib/payrollRules";

function monthFromDateKey(date) {
  return String(date || todayDateKey()).slice(0, 7);
}

function cleanText(value) {
  return String(value || "").trim();
}

function reviewerIsAvailable(user) {
  if (!user?.isActive) return false;
  if (user.role === "hr") return true;
  return user.role === "employee" &&
    user.employee?.employeeType === "manager" &&
    user.employee?.status !== "inactive";
}

async function employeeUserId(employeeId) {
  const user = await User.findOne({
    employee: employeeId,
    role: "employee",
    isActive: true,
  }).select("_id");
  return user?._id || null;
}

async function upsertNotification({
  employeeId,
  recipientUserId = null,
  audience = "employee",
  eventKey,
  title,
  message,
  date = todayDateKey(),
  href = "",
}) {
  if (!employeeId || !eventKey || !title || !message) return null;

  // Keep compatibility with the existing unique index
  // { employee, type, date } by including the recipient in the event type.
  const recipientSuffix = recipientUserId ? `:${recipientUserId}` : "";
  const type = `${eventKey}${recipientSuffix}`;
  const notificationDate = String(date || todayDateKey()).slice(0, 10);

  try {
    return await Notification.findOneAndUpdate(
      { employee: employeeId, type, date: notificationDate },
      {
        $set: {
          employee: employeeId,
          recipientUser: recipientUserId || null,
          audience,
          type,
          title: cleanText(title),
          message: cleanText(message),
          date: notificationDate,
          month: monthFromDateKey(notificationDate),
          href: cleanText(href),
          isRead: false,
        },
        $setOnInsert: {
          lateCount: 1,
          halfDayApplied: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Notifications must never make the primary attendance/request/payroll action fail.
    console.error("Notification write failed:", error);
    return null;
  }
}

export async function notifyEmployee({
  employeeId,
  eventKey,
  title,
  message,
  date = todayDateKey(),
  href = "/employee/dashboard",
}) {
  const recipientUserId = await employeeUserId(employeeId);
  return upsertNotification({
    employeeId,
    recipientUserId,
    audience: "employee",
    eventKey,
    title,
    message,
    date,
    href,
  });
}

export async function notifyUsers({
  employeeId,
  userIds = [],
  eventKey,
  title,
  message,
  date = todayDateKey(),
  href = "",
}) {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))];
  if (!uniqueIds.length) return [];
  return Promise.all(
    uniqueIds.map((userId) =>
      upsertNotification({
        employeeId,
        recipientUserId: userId,
        audience: "reviewer",
        eventKey,
        title,
        message,
        date,
        href,
      })
    )
  );
}

export async function notifyAssignedReviewer({
  employeeId,
  eventKey,
  title,
  message,
  date = todayDateKey(),
  hrHref = "",
  managerHref = "",
}) {
  const employee = await Employee.findById(employeeId)
    .select("fullName employeeId reportingHead")
    .lean();
  if (!employee) return [];

  let reviewer = null;
  if (employee.reportingHead) {
    const head = await User.findById(employee.reportingHead)
      .select("_id isActive role employee")
      .populate("employee", "employeeType status");
    if (reviewerIsAvailable(head)) reviewer = head;
  }

  const employeeLabel = `${employee.fullName || "Employee"}${employee.employeeId ? ` (${employee.employeeId})` : ""}`;

  // HR should always be able to see that an employee request arrived, even when
  // the assigned Reporting Head/Manager is the actual approver. The assigned
  // Manager additionally receives the same request in the employee-side bell.
  const hrs = await User.find({ role: "hr", isActive: true }).select("_id").lean();
  const tasks = [
    notifyUsers({
      employeeId,
      userIds: hrs.map((user) => user._id),
      eventKey,
      title,
      message: `${employeeLabel}: ${message}`,
      date,
      href: hrHref,
    }),
  ];

  if (reviewer?.role === "employee") {
    tasks.push(
      notifyUsers({
        employeeId,
        userIds: [reviewer._id],
        eventKey,
        title,
        message: `${employeeLabel}: ${message}`,
        date,
        href: managerHref,
      })
    );
  }

  const results = await Promise.all(tasks);
  return results.flat();
}

export async function notifyActiveHr({
  employeeId,
  eventKey,
  title,
  message,
  date = todayDateKey(),
  href = "",
}) {
  const [employee, hrs] = await Promise.all([
    Employee.findById(employeeId).select("fullName employeeId").lean(),
    User.find({ role: "hr", isActive: true }).select("_id").lean(),
  ]);
  if (!employee || !hrs.length) return [];
  const employeeLabel = `${employee.fullName || "Employee"}${employee.employeeId ? ` (${employee.employeeId})` : ""}`;
  return notifyUsers({
    employeeId,
    userIds: hrs.map((user) => user._id),
    eventKey,
    title,
    message: `${employeeLabel}: ${message}`,
    date,
    href,
  });
}
