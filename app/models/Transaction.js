import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: {
        type: String,
        enum: ["salary", "bonus", "advance", "expense", "reimbursement", "loan-collect"],
        required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    mode: { type: String, enum: ["cash", "online"], required: true },
    remarks: { type: String, required: true, trim: true }, // compulsory, as requested
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    editedAt: { type: Date, default: null },
    auditHistory: { type: [{ editedAt: { type: Date, required: true }, editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, oldValue: { type: mongoose.Schema.Types.Mixed, required: true } }], default: [] },
}, { timestamps: true });
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
