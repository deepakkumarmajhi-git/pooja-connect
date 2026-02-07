import mongoose from "mongoose";

const PriestServiceSchema = new mongoose.Schema(
  {
    priestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    catalogId: { type: mongoose.Schema.Types.ObjectId, ref: "PujaCatalog", required: true },

    customPrice: { type: Number, required: true },
    customDescription: { type: String, default: "" },

    modesSupported: { type: [String], enum: ["HOME", "ONLINE"], default: ["HOME"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PriestServiceSchema.index({ priestId: 1, catalogId: 1 }, { unique: true });

export default mongoose.models.PriestService ||
  mongoose.model("PriestService", PriestServiceSchema);
