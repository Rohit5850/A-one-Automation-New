import dbConnect from "./dbConnect";
import Employee from "@/app/models/Employee";
import LeaveRequest from "@/app/models/LeaveRequest";

const ANNUAL_EARNED_QUOTA = 18; // days/year, accrues ~1.5/month
const ANNUAL_PATERNITY_QUOTA = 5; // fixed days/year

function daysInclusive(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return Math.round((to - from) / 86400000) + 1;
}

function monthsBetween(a, b) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// Returns { earned: {available, consumed, accruedSoFar, annualQuota},
//           paternity: {available, consumed, annualQuota},
//           unpaid: {consumed} }
export async function computeLeaveBalance(employeeId) {
  await dbConnect();
  const employee = await Employee.findById(employeeId).select("dateOfJoining");
  const joinDate = employee?.dateOfJoining ? new Date(employee.dateOfJoining) : new Date();

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  const approvedThisYear = await LeaveRequest.find({
    employee: employeeId,
    status: "approved",
    fromDate: { $gte: yearStart, $lte: yearEnd },
  });

  let consumedEarned = 0;
  let consumedPaternity = 0;
  let consumedUnpaid = 0;

  for (const req of approvedThisYear) {
    const days = daysInclusive(req.fromDate, req.toDate);
    if (req.leaveType === "earned") consumedEarned += days;
    else if (req.leaveType === "paternity") consumedPaternity += days;
    else if (req.leaveType === "unpaid") consumedUnpaid += days;
  }

  const monthsWorked = Math.max(0, monthsBetween(joinDate, now)) + 1;
  const accruedSoFar = Math.min(ANNUAL_EARNED_QUOTA, Math.round(monthsWorked * 1.5 * 10) / 10);

  return {
    earned: {
      available: Math.max(0, accruedSoFar - consumedEarned),
      consumed: consumedEarned,
      accruedSoFar,
      annualQuota: ANNUAL_EARNED_QUOTA,
    },
    paternity: {
      available: Math.max(0, ANNUAL_PATERNITY_QUOTA - consumedPaternity),
      consumed: consumedPaternity,
      annualQuota: ANNUAL_PATERNITY_QUOTA,
    },
    unpaid: {
      consumed: consumedUnpaid,
    },
  };
}
