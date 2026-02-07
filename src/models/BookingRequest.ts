import mongoose from "mongoose";

const BookingRequestSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    priestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priestServiceId: { type: mongoose.Schema.Types.ObjectId, ref: "PriestService", required: true },

    status: { type: String, enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"], default: "PENDING" },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

BookingRequestSchema.index({ bookingId: 1, priestId: 1 }, { unique: true });
BookingRequestSchema.index({ priestId: 1, status: 1, createdAt: -1 });

export default mongoose.models.BookingRequest ||
  mongoose.model("BookingRequest", BookingRequestSchema);
