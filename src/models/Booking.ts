import mongoose from "mongoose";

const AddonSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null until assigned (auto-assign)
    priestServiceId: { type: mongoose.Schema.Types.ObjectId, ref: "PriestService", default: null },

    catalogId: { type: mongoose.Schema.Types.ObjectId, ref: "PujaCatalog", required: true },
    catalogSlug: { type: String, required: true },

    bookingType: { type: String, enum: ["PICK_PRIEST", "AUTO_ASSIGN"], required: true },
    mode: { type: String, enum: ["HOME", "ONLINE"], required: true },

    scheduledAt: { type: Date, required: true },
    city: { type: String, default: "Bhubaneswar" },
    area: { type: String, default: "" },
    fullAddress: { type: String, default: "" },

    notes: { type: String, default: "" },

    status: {
      type: String,
      enum: ["PENDING_PRIEST", "ACCEPTED", "SCHEDULED", "COMPLETED", "REJECTED", "CANCELLED"],
      default: "PENDING_PRIEST",
    },

    addons: { type: [AddonSchema], default: [] },

    pricing: {
      servicePrice: { type: Number, required: true },
      addonsTotal: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      total: { type: Number, required: true },
      priestEarningEstimate: { type: Number, required: true },
    },

    payment: {
      status: { type: String, enum: ["PENDING", "CONFIRMED_BY_ADMIN"], default: "PENDING" },
      method: { type: String, default: "OFFLINE" }, // MVP
      reference: { type: String, default: "" },
    },

    payout: {
      status: { type: String, enum: ["NOT_DUE", "DUE", "PAID"], default: "NOT_DUE" },
      paidAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
