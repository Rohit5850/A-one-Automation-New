import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    amount: { type: Number, required: true }, // total loan amount given
    monthlyDeduction: { type: Number, required: true }, // auto-deducted from salary each month
    totalMonths: { type: Number, required: true }, // how many months it will take to recover
    monthsDeducted: { type: Number, default: 0 }, // how many months already auto-deducted
    startMonth: { type: String, required: true }, // "YYYY-MM" - first month deduction applies
    remarks: { type: String, trim: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
