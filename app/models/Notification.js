import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Employee this notification is about. For employee-facing notifications this
    // is also the recipient employee. For HR/Manager alerts this is the subject.
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    // Optional exact login account recipient. Old late-arrival notifications do not
    // have this field, so the API keeps backward compatibility with employee-only rows.
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    audience: {
      type: String,
      enum: ["employee", "reviewer"],
      default: "employee",
      index: true,
    },
    // Kept flexible so each request/action can use a unique idempotent event key.
    // Existing late-arrival rows continue to use exactly "late-arrival".
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    month: { type: String, required: true, index: true },
    href: { type: String, trim: true, default: "" },
    lateCount: { type: Number, min: 1, default: 1 },
    halfDayApplied: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Retain the existing index shape for backward database compatibility. New event
// types include their request/action id (and recipient id where applicable), so
// separate events do not collide with one another.
NotificationSchema.index({ employee: 1, type: 1, date: 1 }, { unique: true });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
