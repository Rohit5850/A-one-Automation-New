import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for easy uniqueness per day
      required: true,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "half-day", "leave", "absent", "holiday", "week-off"],
      default: "present",
    },
    reason: { type: String, trim: true }, // why on leave/half-day, or holiday name
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// One attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
