import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    // paternity stays in the schema only so old database records remain readable.
    // New requests do not accept it.
    leaveType: { type: String, enum: ["earned", "paternity", "comp-off", "unpaid"], required: true },
    leaveFraction: { type: Number, enum: [0.5, 1], default: 1 },
    halfDayPart: { type: String, enum: ["first-half", "second-half", null], default: null },
    note: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", LeaveRequestSchema);
