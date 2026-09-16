// Browser-side salary slip PDF generator.
// Keeps the payroll calculation authoritative: this file only formats values
// already returned by /api/payroll/[employeeId].
// Requires the existing "jspdf" package used by this project.

const COMPANY = {
  name: "A-One Automation Solutions",
  brand: "A-One Automation",
  address:
    "Chhatrachhaya Colony, D-111, Pithampur, Smart Industrial Park, Dhar, Madhya Pradesh - 454774",
};

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function monthRange(month) {
  const [year, monthNo] = String(month).split("-").map(Number);
  const start = new Date(year, monthNo - 1, 1);
  const end = new Date(year, monthNo, 0);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function safeText(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function paidDays(payroll) {
  const s = payroll?.attendanceSummary || {};
  return round2(
    Number(s.present || 0) +
      Number(s.paidLeave || 0) +
      Number(s.holiday || 0) +
      Number(s.weekOff || 0) +
      Number(s.halfDay || 0) * 0.5
  );
}

function drawWebsiteLogo(doc, x, y) {
  // Mirrors the website's compact "A" brand mark without depending on an image file.
  doc.setFillColor(91, 79, 240);
  doc.roundedRect(x, y, 18, 18, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("A", x + 9, y + 12.2, { align: "center" });

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(13);
  doc.text(COMPANY.name, x + 23, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 95);
  doc.setFontSize(7.8);
  const addressLines = doc.splitTextToSize(COMPANY.address, 145);
  doc.text(addressLines, x + 23, y + 12);
}

function drawKeyValue(doc, label, value, x, y, labelWidth = 29, valueWidth = 48) {
  doc.setFontSize(8.3);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);
  const lines = doc.splitTextToSize(safeText(value), valueWidth);
  doc.text(lines, x + labelWidth, y);
}

function drawSectionTitle(doc, title, y) {
  doc.setFillColor(247, 248, 250);
  doc.rect(15, y, 180, 7, "F");
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(title.toUpperCase(), 18, y + 4.8);
  return y + 7;
}

function drawAmountRow(doc, label, amount, y, options = {}) {
  const { bold = false, note = "", shaded = false } = options;
  if (shaded) {
    doc.setFillColor(250, 250, 251);
    doc.rect(15, y, 180, 8, "F");
  }
  doc.setDrawColor(225, 228, 232);
  doc.line(15, y + 8, 195, y + 8);
  doc.setTextColor(45, 55, 72);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(8.5);
  doc.text(label, 18, y + 5.2);
  if (note) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 125, 135);
    doc.setFontSize(7.2);
    doc.text(note, 85, y + 5.2);
  }
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(8.5);
  doc.text(money(amount), 191, y + 5.2, { align: "right" });
  return y + 8;
}

function drawCountRow(doc, payroll, y) {
  const s = payroll?.attendanceSummary || {};
  const items = [
    ["Present", s.present || 0],
    ["Half Day", s.halfDay || 0],
    ["Paid Leave", Math.max(0, (s.paidLeave || 0) - (s.compOffLeave || 0))],
    ["C-Off", s.compOffLeave || 0],
    ["Unpaid Leave", s.unpaidLeave || 0],
    ["Absent", s.absent || 0],
    ["Holiday", s.holiday || 0],
    ["Week Off", s.weekOff || 0],
  ];

  const step = 22.5;
  const boxW = 21.2;
  items.forEach(([label, value], index) => {
    const x = 15 + index * step;
    doc.setFillColor(250, 250, 251);
    doc.roundedRect(x, y, boxW, 13, 1.5, 1.5, "F");
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.text(String(value), x + boxW / 2, y + 5.2, { align: "center" });
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(label, x + boxW / 2, y + 10.2, { align: "center" });
  });
  return y + 16;
}

export async function generateSalarySlipPdf(employee, payroll, month) {
  if (!employee) throw new Error("Employee data is required for salary slip.");
  if (!payroll) throw new Error("Payroll data is required for salary slip.");

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const summary = payroll.attendanceSummary || {};
  const paidDaysEquivalent = paidDays(payroll);
  const salaryValue = Number(payroll.salaryRate ?? employee.salary ?? 0);
  const wageType = payroll.wageType || employee.wageType;
  const totalDays = Number(payroll.totalDays || 0);
  const dailyRate = Number.isFinite(Number(payroll.dailyRate))
    ? round2(payroll.dailyRate)
    : wageType === "monthly"
      ? totalDays > 0
        ? round2(salaryValue / totalDays)
        : 0
      : round2(salaryValue);
  const baseEarnings = round2(payroll.grossEarnings || 0);
  const bonus = round2(payroll.bonus || 0);
  const overtimePay = round2(payroll.overtimePay || 0);
  const overtimeHours = round2(payroll.overtimeHours || 0);
  const totalEarnings = round2(baseEarnings + bonus + overtimePay);
  const salaryPaid = round2(payroll.salaryPaid || 0);
  const advance = round2(payroll.advance || 0);
  const loanDeduction = round2(payroll.loanDeduction || 0);
  const totalPayments = round2(salaryPaid + advance + loanDeduction);
  const previousBalance = round2(payroll.previousBalance || 0);
  const netPayable = round2(payroll.netPayable || 0);

  // Header title + company branding
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SALARY SLIP", 15, 13);
  drawWebsiteLogo(doc, 18, 20);
  doc.setDrawColor(210, 214, 220);
  doc.line(15, 43, 195, 43);

  // Employee details - close to the supplied reference layout, with additional useful fields.
  let y = 50;
  drawKeyValue(doc, "Staff Name", employee.fullName, 18, y, 30, 54);
  drawKeyValue(doc, "Mobile Number", employee.phone, 108, y, 31, 50);
  y += 7;
  drawKeyValue(doc, "Employee ID", employee.employeeId, 18, y, 30, 54);
  drawKeyValue(doc, "Department", employee.department, 108, y, 31, 50);
  y += 7;
  drawKeyValue(doc, "Designation", employee.designation, 18, y, 30, 54);
  drawKeyValue(doc, "Date of Joining", formatDate(employee.dateOfJoining), 108, y, 31, 50);
  y += 7;
  drawKeyValue(
    doc,
    wageType === "daily" ? "Daily Wage" : "Monthly Salary",
    money(salaryValue),
    18,
    y,
    30,
    54
  );
  drawKeyValue(doc, "Salary Cycle", monthRange(month), 108, y, 31, 50);
  y += 7;
  drawKeyValue(doc, "Wage Type", wageType === "daily" ? "Daily Wage" : "Monthly", 18, y, 30, 54);
  drawKeyValue(doc, "Email", employee.email, 108, y, 31, 50);
  y += 7;

  if (employee.address) {
    doc.setFontSize(8.3);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);
    doc.text("Address", 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    const addr = doc.splitTextToSize(employee.address, 145);
    doc.text(addr, 48, y);
    y += Math.max(7, addr.length * 4);
  }

  y += 2;
  y = drawSectionTitle(doc, "Attendance Summary", y);
  y += 3;
  y = drawCountRow(doc, payroll, y);

  // Calculation details requested by the user.
  y = drawSectionTitle(doc, "Salary Calculation", y);
  y += 2;
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.1);

  const calculationLines = [
    wageType === "monthly"
      ? `Daily Rate = Monthly Salary / Calendar Days = ${money(salaryValue)} / ${totalDays} = ${money(dailyRate)}`
      : `Daily Rate = ${money(dailyRate)}`,
    `Paid Days = Present + Paid Leave + Holiday + Week Off + (Half Day x 0.5) = ${paidDaysEquivalent}`,
    `Attendance Earnings = Daily Rate x Paid Days = ${money(dailyRate)} x ${paidDaysEquivalent} = ${money(baseEarnings)}`,
    `Overtime Pay = approved HR overtime marked as Pay = ${money(overtimePay)}`,
    `Net Payable = Previous Balance + Attendance Earnings + Bonus + Overtime Pay - Salary Paid - Advance - Loan EMI`,
  ];
  calculationLines.forEach((line) => {
    const lines = doc.splitTextToSize(line, 172);
    doc.text(lines, 18, y + 4);
    y += Math.max(6, lines.length * 4);
  });
  y += 1;

  y = drawSectionTitle(doc, "Earnings", y);
  y = drawAmountRow(doc, `Attendance Earnings (${paidDaysEquivalent} paid days)`, baseEarnings, y);
  y = drawAmountRow(doc, "Bonus", bonus, y);
  y = drawAmountRow(doc, `Overtime Pay (${overtimeHours} hrs)`, overtimePay, y);
  y = drawAmountRow(doc, "Gross Earnings", totalEarnings, y, { bold: true, shaded: true });

  y += 3;
  y = drawSectionTitle(doc, "Payments & Deductions", y);
  y = drawAmountRow(doc, "Salary Paid", salaryPaid, y);
  y = drawAmountRow(doc, "Advance Paid", advance, y);
  y = drawAmountRow(doc, "Loan EMI Deducted", loanDeduction, y);
  y = drawAmountRow(doc, "Gross Payments / Deductions", totalPayments, y, {
    bold: true,
    shaded: true,
  });

  y += 3;
  y = drawAmountRow(doc, "Previous Month Closing Balance", previousBalance, y, { bold: true });
  y += 3;

  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(190, 196, 204);
  doc.roundedRect(15, y, 180, 14, 1.5, 1.5, "FD");
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  doc.text("Net Payable (Earnings + Previous Balance - Payments)", 19, y + 8.6);
  doc.setFontSize(11);
  doc.text(money(netPayable), 191, y + 8.6, { align: "right" });

  y += 21;
  doc.setTextColor(115, 120, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.text(
    "This is a system-generated salary slip based on attendance, payroll transactions, bonus, advance and loan deductions.",
    15,
    y
  );
  doc.text(`Generated for salary cycle: ${monthRange(month)}`, 15, y + 4.5);

  const filenameSafeName = safeText(employee.fullName)
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  doc.save(`${filenameSafeName || "Employee"}_${month}_SalarySlip.pdf`);
}
