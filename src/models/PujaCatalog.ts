import mongoose from "mongoose";

const PujaCatalogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    defaultDurationMins: { type: Number, default: 90 },
    modesSupported: { type: [String], enum: ["HOME", "ONLINE"], default: ["HOME"] },
    isActive: { type: Boolean, default: true },

    startingFrom: { type: Number, default: 0 },
    typicalMin: { type: Number, default: 0 },
    typicalMax: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.PujaCatalog ||
  mongoose.model("PujaCatalog", PujaCatalogSchema);
