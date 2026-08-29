// One-time script to create the first HR login.
// Run: node scripts/createHR.mjs "hr@yourcompany.com" "StrongPassword123!"
//
// Requires MONGODB_URI to be set in the environment, e.g.:
//   MONGODB_URI="mongodb+srv://..." node scripts/createHR.mjs "hr@yourcompany.com" "StrongPassword123!"

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/createHR.mjs "hr@company.com" "password"');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["hr", "employee"], required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("A user with this email already exists.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email: email.toLowerCase(), passwordHash, role: "hr" });

  console.log(`HR account created for ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
