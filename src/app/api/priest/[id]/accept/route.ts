import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import BookingRequest from "@/models/BookingRequest";
import Booking from "@/models/Booking";
import PriestService from "@/models/PriestService";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "PRIEST") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  await connectDB();

  const profile = await PriestProfile.findOne({ userId: session.user.id }).lean();
  if (!profile || profile.approvalStatus !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Priest not approved yet" }, { status: 403 });
  }

  // request must belong to this priest
  const reqDoc: any = await BookingRequest.findOne({
    _id: id,
    priestId: session.user.id,
    status: "PENDING",
  }).lean();

  if (!reqDoc) {
    return NextResponse.json({ ok: false, error: "Request not found/expired" }, { status: 404 });
  }

  const service: any = await PriestService.findOne({
    _id: reqDoc.priestServiceId,
    priestId: session.user.id,
    isActive: true,
  }).lean();

  if (!service) {
    return NextResponse.json({ ok: false, error: "Service not active" }, { status: 400 });
  }

  // Try to assign booking ONLY if no priest assigned yet (first accept wins)
  const booking: any = await Booking.findOneAndUpdate(
    {
      _id: reqDoc.bookingId,
      bookingType: "AUTO_ASSIGN",
      priestId: null,
      status: "PENDING_PRIEST",
    },
    {
      $set: {
        priestId: session.user.id,
        priestServiceId: service._id,
        status: "ACCEPTED",
        "pricing.servicePrice": Number(service.customPrice),
        "pricing.total": Number(service.customPrice) + Number((await Booking.findById(reqDoc.bookingId).lean())?.pricing?.addonsTotal || 0) + Number((await Booking.findById(reqDoc.bookingId).lean())?.pricing?.platformFee || 0),
      },
    },
    { new: true }
  ).lean();

  if (!booking) {
    // Someone else accepted already
    await BookingRequest.updateOne({ _id: id }, { $set: { status: "EXPIRED" } });
    return NextResponse.json({ ok: false, error: "Already accepted by another priest" }, { status: 409 });
  }

  // Mark this request accepted; expire others
  await BookingRequest.updateOne({ _id: id }, { $set: { status: "ACCEPTED" } });
  await BookingRequest.updateMany(
    { bookingId: reqDoc.bookingId, _id: { $ne: id }, status: "PENDING" },
    { $set: { status: "EXPIRED" } }
  );

  return NextResponse.json({ ok: true, bookingId: String(booking._id) });
}
