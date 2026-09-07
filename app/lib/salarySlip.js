// Generates a salary slip PDF (matching the Earnings/Payments/Net Payable
// breakdown from the Payroll tab) in the browser and triggers a download.
// Requires the "jspdf" package - run: npm install jspdf
export async function generateSalarySlipPdf(employee, payroll, month) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Salary Slip", 20, 20);
  doc.setFontSize(10);
  doc.text(`Month: ${month}`, 20, 28);
  doc.line(20, 32, 190, 32);

  doc.setFontSize(11);
  let y = 42;
  const identityRows = [
    ["Staff Name", employee.fullName],
    ["Employee ID", employee.employeeId],
    ["Mobile Number", employee.phone || "-"],
    ["Wage Type", employee.wageType === "daily" ? "Daily Wage" : "Monthly"],
    ["Salary", employee.salary != null ? `Rs. ${employee.salary}` : "-"],
  ];
  identityRows.forEach(([label, value]) => {
    doc.text(`${label}:`, 20, y);
    doc.text(String(value), 80, y);
    y += 7;
  });

  if (payroll) {
    y += 4;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Earnings", 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text("Present / Paid Days", 25, y);
    doc.text(`Rs. ${payroll.grossEarnings}`, 150, y);
    y += 6;
    if (payroll.bonus > 0) {
      doc.text("Bonus", 25, y);
      doc.text(`Rs. ${payroll.bonus}`, 150, y);
      y += 6;
    }
    doc.setFont(undefined, "bold");
    doc.text("Gross Earnings", 25, y);
    doc.text(`Rs. ${payroll.grossEarnings + payroll.bonus}`, 150, y);
    doc.setFont(undefined, "normal");

    y += 10;
    doc.setFontSize(12);
    doc.text("Payments & Deductions", 20, y);
    y += 7;
    doc.setFontSize(10);
    if (payroll.salaryPaid > 0) {
      doc.text("Salary Paid", 25, y);
      doc.text(`Rs. ${payroll.salaryPaid}`, 150, y);
      y += 6;
    }
    if (payroll.advance > 0) {
      doc.text("Advance Paid", 25, y);
      doc.text(`Rs. ${payroll.advance}`, 150, y);
      y += 6;
    }
    if (payroll.loanDeduction > 0) {
      doc.text("Loan EMI Deducted", 25, y);
      doc.text(`Rs. ${payroll.loanDeduction}`, 150, y);
      y += 6;
    }

    y += 6;
    doc.text("Previous Month Balance", 25, y);
    doc.text(`Rs. ${payroll.previousBalance}`, 150, y);
    y += 10;

    doc.line(20, y - 4, 190, y - 4);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Net Payable", 20, y + 4);
    doc.text(`Rs. ${payroll.netPayable}`, 150, y + 4);
    doc.setFont(undefined, "normal");
  }

  doc.save(`${employee.fullName.replace(/\s+/g, "_")}_${month}_SalarySlip.pdf`);
}
