// Browser-side salary slip PDF generator.
// Payroll API remains the single calculation source; this file only formats returned values.

const COMPANY = {
  name: "A-One Automation Solutions",
  address: "Chhatrachhaya Colony, D-111, Pithampur, Smart Industrial Park, Dhar, Madhya Pradesh - 454774",
};

const round2 = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;
const money = (v) => `Rs. ${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const safe = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function monthRange(month) {
  const [y, m] = String(month).split("-").map(Number);
  return `${formatDate(new Date(y, m - 1, 1))} - ${formatDate(new Date(y, m, 0))}`;
}
function employeeName(employee) {
  const title = { mr: "Mr.", mrs: "Mrs.", miss: "Miss" }[employee?.title] || "";
  return `${title}${title ? " " : ""}${safe(employee?.fullName)}`;
}
function drawHeader(doc, pageLabel = "SALARY SLIP") {
  doc.setTextColor(55, 65, 81); doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text(pageLabel, 15, 13);
  doc.setFillColor(91, 79, 240); doc.roundedRect(18, 19, 16, 16, 2.5, 2.5, "F");
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.text("A", 26, 29.8, { align: "center" });
  doc.setTextColor(24,24,27); doc.setFontSize(13); doc.text(COMPANY.name, 39, 25);
  doc.setFont("helvetica", "normal"); doc.setTextColor(90,90,95); doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(COMPANY.address, 150), 39, 30);
  doc.setDrawColor(210,214,220); doc.line(15, 41, 195, 41);
}
function section(doc, title, y) {
  doc.setFillColor(247,248,250); doc.rect(15,y,180,7,"F"); doc.setTextColor(71,85,105);
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text(title.toUpperCase(),18,y+4.8); return y+8;
}
function kv(doc, label, value, x, y, lw=30, vw=52) {
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(75,85,99); doc.text(label,x,y);
  doc.setFont("helvetica","normal"); doc.setTextColor(31,41,55); doc.text(doc.splitTextToSize(safe(value),vw),x+lw,y);
}
function amountRow(doc, label, amount, y, { bold=false, shaded=false }={}) {
  if (shaded) { doc.setFillColor(250,250,251); doc.rect(15,y,180,7.5,"F"); }
  doc.setDrawColor(228,231,235); doc.line(15,y+7.5,195,y+7.5);
  doc.setTextColor(45,55,72); doc.setFont("helvetica",bold?"bold":"normal"); doc.setFontSize(8.2); doc.text(label,18,y+5);
  doc.setTextColor(31,41,55); doc.text(money(amount),191,y+5,{align:"right"}); return y+7.5;
}
function countBoxes(doc, payroll, y) {
  const s=payroll?.attendanceSummary||{}; const l=payroll?.leaveBreakdown||{};
  const items=[["Present",s.present||0],["Half Day",s.halfDay||0],["EL",l.earnedLeave||0],["C-Off",l.cOff||0],["Unpaid",s.unpaidLeave||0],["Absent",s.absent||0],["Holiday",s.holiday||0],["Week Off",s.weekOff||0]];
  const step=22.5, w=21.3;
  items.forEach(([label,value],i)=>{const x=15+i*step;doc.setFillColor(250,250,251);doc.roundedRect(x,y,w,12,1.4,1.4,"F");doc.setTextColor(31,41,55);doc.setFont("helvetica","bold");doc.setFontSize(8.4);doc.text(String(value),x+w/2,y+4.8,{align:"center"});doc.setTextColor(100,116,139);doc.setFont("helvetica","normal");doc.setFontSize(5.8);doc.text(label,x+w/2,y+9.5,{align:"center"});});
  return y+15;
}

export async function generateSalarySlipPdf(employee, payroll, month) {
  if (!employee) throw new Error("Employee data is required for salary slip.");
  if (!payroll) throw new Error("Payroll data is required for salary slip.");
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const p=payroll, c=p.salaryComponents||{}, l=p.leaveBreakdown||{};
  const monthly=p.wageType==="monthly", paid=round2(p.paidDaysEquivalent), salary=round2(p.salaryRate);
  const attendance=round2(p.grossEarnings), bonus=round2(p.bonus), ot=round2(p.overtimePay), totalEarnings=round2(attendance+bonus+ot);
  const salaryPaid=round2(p.salaryPaid), advance=round2(p.advance), loan=round2(p.loanDeduction), totalDeductions=round2(salaryPaid+advance+loan);

  drawHeader(doc); let y=48;
  kv(doc,"Staff Name",employeeName(employee),18,y); kv(doc,"Mobile",employee.phone,108,y,25,55); y+=7;
  kv(doc,"Employee ID",employee.employeeId,18,y); kv(doc,"Department",employee.department,108,y,25,55); y+=7;
  kv(doc,"Designation",employee.designation,18,y); kv(doc,"Joining Date",formatDate(employee.dateOfJoining),108,y,25,55); y+=7;
  kv(doc,monthly?"Monthly Gross":"Daily Wage",money(salary),18,y); kv(doc,"Salary Cycle",monthRange(month),108,y,25,55); y+=9;

  y=section(doc,"Attendance & Leave Summary",y); y=countBoxes(doc,p,y); y+=1;
  kv(doc,"Paid Days",paid,18,y); kv(doc,"Calendar Days",p.totalDays||0,108,y,25,55); y+=7;
  kv(doc,"Earned Leave",l.earnedLeave||0,18,y); kv(doc,"C-Off Leave",l.cOff||0,108,y,25,55); y+=7;
  kv(doc,"Unpaid Leave",l.unpaidLeave||0,18,y); kv(doc,"Sandwich Unpaid",l.sandwichUnpaid||0,108,y,25,55); y+=9;

  y=section(doc,"Salary Structure & Earnings",y);
  if(monthly){y=amountRow(doc,"Basic Salary - Full Month",c.basicSalary,y);y=amountRow(doc,"HRA - Full Month",c.hra,y);y=amountRow(doc,"Other Allowance - Full Month",c.otherAllowance,y);y=amountRow(doc,"Monthly Gross Salary",salary,y,{bold:true,shaded:true});y+=2;y=amountRow(doc,"Basic Earned",c.basicEarnings,y);y=amountRow(doc,"HRA Earned",c.hraEarnings,y);y=amountRow(doc,"Other Allowance Earned",c.otherAllowanceEarnings,y);y=amountRow(doc,"Attendance / Paid-Day Earnings",attendance,y,{bold:true});}
  else { y=amountRow(doc,"Attendance / Worked-Day Earnings",attendance,y,{bold:true}); }
  y=amountRow(doc,"Bonus",bonus,y); y=amountRow(doc,`Overtime Pay (${round2(p.overtimeHours)} hrs)`,ot,y); y=amountRow(doc,"Total Current-Month Earnings",totalEarnings,y,{bold:true,shaded:true});

  // Page 2 intentionally keeps deductions and final settlement together so no content can overflow A4.
  doc.addPage(); drawHeader(doc,"SALARY SLIP - SETTLEMENT"); y=49;
  y=section(doc,"Attendance Deduction",y);
  y=amountRow(doc,monthly?"Attendance / Absent Deduction":"Attendance Deduction",monthly?p.attendanceDeduction:0,y,{bold:true});
  doc.setTextColor(100,116,139); doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
  const formula=monthly?`Monthly deduction basis: ${money(salary)} / ${p.totalDays||0} calendar days. Paid equivalent: ${paid} days.`:"Daily-wage payroll uses actual paid-day earnings.";
  doc.text(doc.splitTextToSize(formula,170),18,y+5); y+=13;

  y=section(doc,"Payments & Deductions",y);
  y=amountRow(doc,"Salary Paid",salaryPaid,y); y=amountRow(doc,"Advance Paid",advance,y); y=amountRow(doc,"Loan EMI Deducted",loan,y); y=amountRow(doc,"Total Payments / Deductions",totalDeductions,y,{bold:true,shaded:true}); y+=4;
  y=section(doc,"Final Settlement",y);
  y=amountRow(doc,"Previous Month Closing Balance",p.previousBalance,y,{bold:true});
  y=amountRow(doc,"Current-Month Earnings",totalEarnings,y);
  y=amountRow(doc,"Less: Salary Paid + Advance + Loan EMI",totalDeductions,y);
  y+=4; doc.setFillColor(245,247,250);doc.setDrawColor(190,196,204);doc.roundedRect(15,y,180,15,1.5,1.5,"FD");doc.setTextColor(31,41,55);doc.setFont("helvetica","bold");doc.setFontSize(9.5);doc.text("NET PAYABLE",19,y+9.3);doc.setFontSize(12);doc.text(money(p.netPayable),191,y+9.3,{align:"right"});y+=23;

  y=section(doc,"Calculation Reference",y); doc.setTextColor(71,85,105);doc.setFont("helvetica","normal");doc.setFontSize(7.5);
  const lines=[`Daily rate: ${money(p.dailyRate)}${monthly?` = ${money(salary)} / ${p.totalDays||0} calendar days`:""}`,`Paid days: ${paid}. Attendance earnings: ${money(attendance)}. Attendance deduction: ${money(p.attendanceDeduction)}.`,`Net payable = Previous Balance + Attendance Earnings + Bonus + OT Pay - Salary Paid - Advance - Loan EMI.`,`Sunday/Holiday C-Off settlement is not included in overtime pay; only HR-approved Pay settlement is included.`];
  lines.forEach(line=>{const a=doc.splitTextToSize(line,170);doc.text(a,18,y+4);y+=Math.max(6,a.length*4);});
  y+=5;doc.setTextColor(115,120,130);doc.setFontSize(7);doc.text("System-generated salary slip. Payroll API values are the authoritative calculation source.",15,y);doc.text(`Salary cycle: ${monthRange(month)}`,15,y+4.5);

  const filename=safe(employee.fullName).replace(/[^a-z0-9]+/gi,"_").replace(/^_+|_+$/g,"");
  doc.save(`${filename||"Employee"}_${month}_SalarySlip.pdf`);
}
