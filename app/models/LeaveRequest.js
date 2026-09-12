import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    fromDate: { type: String, required: true }, // "YYYY-MM-DD"
    toDate: { type: String, required: true }, // "YYYY-MM-DD"
    leaveType: {
      type: String,
      enum: ["earned", "paternity", "unpaid"],
      required: true,
    },
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

export default mongoose.models.LeaveRequest ||
  mongoose.model("LeaveRequest", LeaveRequestSchema);
