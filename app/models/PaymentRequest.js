import mongoose from "mongoose";

const PaymentRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["loan", "advance"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    monthlyDeduction: { type: Number, min: 0.01 }, // only relevant for type=loan
    totalMonths: { type: Number, min: 1 }, // only relevant for type=loan
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentRequest ||
  mongoose.model("PaymentRequest", PaymentRequestSchema);
