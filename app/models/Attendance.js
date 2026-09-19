import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    displayName: { type: String, trim: true },
    landmark: { type: String, trim: true },
    placeName: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    postcode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, default: null },
    checkInLocation: { type: LocationSchema },
    checkOutLocation: { type: LocationSchema },
  },
  { _id: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },

    // Legacy/day summary fields are intentionally retained so the existing
    // payroll, reports and old attendance records keep working.
    checkIn: { type: Date }, // first check-in of the day
    checkOut: { type: Date }, // latest check-out; null while a session is active
    checkInLocation: { type: LocationSchema }, // first check-in location
    checkOutLocation: { type: LocationSchema }, // latest check-out location

    // Multiple IN/OUT punches in one day. Gaps between closed sessions are breaks.
    sessions: { type: [SessionSchema], default: [] },

    status: {
      type: String,
      enum: ["pending", "present", "half-day", "leave", "absent", "holiday", "week-off"],
      default: "pending",
    },
    reason: { type: String, trim: true },
    leaveType: {
      type: String,
      enum: ["earned", "comp-off", "unpaid"],
      default: null,
    },
    leaveFraction: { type: Number, enum: [0.5, 1], default: 1 },
    statusSource: { type: String, enum: ["auto", "manual"], default: "auto" },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
