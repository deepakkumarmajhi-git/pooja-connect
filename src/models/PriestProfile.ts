import mongoose from "mongoose";

const PriestProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },

    bio: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    languages: { type: [String], default: [] },

    city: { type: String, default: "Bhubaneswar" },
    area: { type: String, default: "" },

    // doc uploads stored as Cloudinary URLs
    documents: { type: [{ type: String }], default: [] },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.PriestProfile ||
  mongoose.model("PriestProfile", PriestProfileSchema);
