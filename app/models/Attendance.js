import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number }, // browser-reported accuracy in metres
    displayName: { type: String, trim: true }, // full human-readable address
    landmark: { type: String, trim: true }, // nearby named POI/building when available
    placeName: { type: String, trim: true }, // road/building/place
    area: { type: String, trim: true }, // neighbourhood/suburb
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    postcode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

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
    checkInLocation: { type: LocationSchema },
    checkOutLocation: { type: LocationSchema },
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
