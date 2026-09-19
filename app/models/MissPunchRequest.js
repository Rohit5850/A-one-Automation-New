import mongoose from "mongoose";

const MissPunchRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true },
    punchType: { type: String, enum: ["check-in", "check-out", "both"], required: true },
    checkInTime: { type: String, default: null },
    checkOutTime: { type: String, default: null },
    note: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);
MissPunchRequestSchema.index({ employee: 1, date: 1, status: 1 });
export default mongoose.models.MissPunchRequest || mongoose.model("MissPunchRequest", MissPunchRequestSchema);
