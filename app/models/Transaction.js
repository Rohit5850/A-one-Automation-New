import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: {
      type: String,
      enum: ["salary", "bonus", "advance", "loan-collect"],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    mode: { type: String, enum: ["cash", "online"], required: true },
    remarks: { type: String, required: true, trim: true }, // compulsory, as requested
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
