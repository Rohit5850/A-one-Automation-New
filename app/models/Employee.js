import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // e.g. "EMP-0001", HR can define this
      required: true,
      unique: true,
      trim: true,
    },
    title: { type: String, enum: ["mr", "mrs", "miss"], default: null },
    fullName: { type: String, required: true, trim: true },
    username: { type: String, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    designation: { type: String, enum: ["Manager", "Assistant Manager", "Executive", "Junior", "Trainee"], trim: true },
    department: { type: String, enum: ["Automation", "Sales", "Electrical", "HR"], trim: true },
    reportingHead: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dateOfJoining: { type: Date },
    dateOfLeaving: { type: Date, default: null }, // set when employee exits the company
    gender: { type: String, enum: ["male", "female", "other"], trim: true },
    wageType: {
      type: String,
      enum: ["daily", "monthly"],
      required: true,
      default: "monthly",
    }, // decides how salary is calculated from attendance
    address: { type: String, trim: true },
    photoUrl: { type: String, trim: true }, // optional, for the employee card
    bloodGroup: { type: String, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    salary: { type: Number, min: 0, select: false }, // monthly gross or daily rate
    basicSalary: { type: Number, min: 0, default: 0, select: false },
    hra: { type: Number, min: 0, default: 0, select: false },
    otherAllowance: { type: Number, min: 0, default: 0, select: false },
    overtimeRatePerHour: { type: Number, min: 0, default: 0, select: false }, // 0 = auto from salary/daily rate
    salaryHistory: {
      type: [
        {
          amount: { type: Number, required: true, min: 0 },
          basicSalary: { type: Number, min: 0, default: 0 },
          hra: { type: Number, min: 0, default: 0 },
          otherAllowance: { type: Number, min: 0, default: 0 },
          wageType: { type: String, enum: ["daily", "monthly"], required: true },
          effectiveMonth: { type: String, required: true }, // YYYY-MM
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    webAttendanceEnabled: {
      type: Boolean,
      default: true, // HR can disable web Check-In/Out from Employee Directory
    },
    fieldWorker: {
      type: Boolean,
      default: false, // if true, GPS location is captured/required on check-in and check-out
    },
    showLocationToEmployee: {
      type: Boolean,
      default: false, // HR controls whether this employee can see saved attendance locations
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // which HR account created this record
    },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
