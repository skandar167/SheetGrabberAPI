import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../mongodb";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin" | "user";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Avoid model recompilation in dev (hot reload)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

// ---------------------------------------------------------------------------
// Seed admin on first connection
// ---------------------------------------------------------------------------
export async function seedAdmin() {
  await connectDB();
  const existing = await User.findOne({ username: "skander" });
  if (!existing) {
    const hash = await bcrypt.hash("admin", 10);
    await User.create({
      username: "skander",
      passwordHash: hash,
      role: "admin",
      status: "approved",
    });
    console.log("[seed] Admin user 'skander' created.");
  }
}
