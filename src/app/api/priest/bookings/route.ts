import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import PriestProfile from "@/models/PriestProfile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "PRIEST") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectDB();

  const profile = await PriestProfile.findOne({ userId: session.user.id }).lean();
  if (!profile || profile.approvalStatus !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Priest not approved yet" }, { status: 403 });
  }

  const items = await Booking.find({
    priestId: session.user.id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, items });
}
