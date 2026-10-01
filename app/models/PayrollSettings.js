import mongoose from "mongoose";
const PayrollSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: "default",
    },
    pfEnabled: {
        type: Boolean,
        default: false,
    },
    pfWageBase: {
        type: String,
        enum: ["basic", "gross"],
        default: "basic",
    },
    pfCeilingMode: {
        type: String,
        enum: ["cap", "eligibility"],
        default: "cap",
    },
    pfEmployeePercent: {
        type: Number,
        min: 0,
        default: 0,
    },
    pfEmployerPercent: {
        type: Number,
        min: 0,
        default: 0,
    },
    pfWageCeiling: {
        type: Number,
        min: 0,
        default: 0,
    },
    esicEnabled: {
        type: Boolean,
        default: false,
    },
    esicWageBase: {
        type: String,
        enum: ["basic", "gross"],
        default: "gross",
    },
    esicCeilingMode: {
        type: String,
        enum: ["cap", "eligibility"],
        default: "eligibility",
    },
    esicEmployeePercent: {
        type: Number,
        min: 0,
        default: 0,
    },
    esicEmployerPercent: {
        type: Number,
        min: 0,
        default: 0,
    },
    esicWageCeiling: {
        type: Number,
        min: 0,
        default: 0,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true });
export default mongoose.models.PayrollSettings ||
    mongoose.model("PayrollSettings", PayrollSettingsSchema);
