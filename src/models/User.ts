import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },

    // Only for Credentials login. Later if you add Google OAuth, it can be optional.
    passwordHash: { type: String, default: "" },

    role: { type: String, enum: ["CUSTOMER", "PRIEST", "ADMIN"], default: "CUSTOMER" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
