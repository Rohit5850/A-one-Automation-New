import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // e.g. "EMP-0001", HR can define this
      required: true,
      unique: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    dateOfJoining: { type: Date },
    dateOfLeaving: { type: Date, default: null }, // set when employee exits the company
    gender: { type: String, enum: ["male", "female", "other"], trim: true },
    address: { type: String, trim: true },
    photoUrl: { type: String, trim: true }, // optional, for the employee card
    bloodGroup: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    salary: { type: Number, select: false }, // sensitive: excluded unless explicitly selected
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // which HR account created this record
    },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
