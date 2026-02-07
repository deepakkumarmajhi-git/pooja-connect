import mongoose from "mongoose";

const CustomerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    city: { type: String, default: "Bhubaneswar" },
    area: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    profileImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.CustomerProfile ||
  mongoose.model("CustomerProfile", CustomerProfileSchema);
