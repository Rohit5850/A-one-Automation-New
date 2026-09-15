import mongoose from "mongoose";

const OvertimeEntrySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    hours: { type: Number, required: true, min: 0.01, max: 24 },
    settlement: { type: String, enum: ["pay", "comp-off"], required: true },
    ratePerHour: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
    compOffDays: { type: Number, min: 0, max: 1, default: 0 },
    note: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

OvertimeEntrySchema.index({ employee: 1, date: 1 });

export default mongoose.models.OvertimeEntry ||
  mongoose.model("OvertimeEntry", OvertimeEntrySchema);
