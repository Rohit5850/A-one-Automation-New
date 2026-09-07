import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    name: { type: String, required: true, trim: true }, // e.g. "Diwali", "Independence Day"
  },
  { timestamps: true }
);

export default mongoose.models.Holiday || mongoose.model("Holiday", HolidaySchema);
