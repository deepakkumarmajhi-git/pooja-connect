import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import PriestProfile from "@/models/PriestProfile";

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

  // Only allow accept if this booking is assigned to this priest (PICK_PRIEST flow)
  const updated = await Booking.findOneAndUpdate(
    { _id: id, priestId: session.user.id, status: "PENDING_PRIEST" },
    { $set: { status: "ACCEPTED" } },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Booking not found or already handled" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, booking: updated });
}

// Priest accept booking endpoint