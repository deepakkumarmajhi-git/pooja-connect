import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Booking from "@/models/Booking";
import PujaCatalog from "@/models/PujaCatalog";
import PriestService from "@/models/PriestService";
import PriestProfile from "@/models/PriestProfile";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params; // ✅ Next 16: await params

    const booking: any = await Booking.findById(id).lean();

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    const role = session.user.role;
    const userId = String(session.user.id);

    const isOwner = String(booking.customerId) === userId;
    const isAssignedPriest = booking.priestId ? String(booking.priestId) === userId : false;
    const isAdmin = role === "ADMIN";

    // CUSTOMER can view own booking
    // PRIEST can view assigned booking
    // ADMIN can view any booking
    if (!(isOwner || isAssignedPriest || isAdmin)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Optional enrichments (safe even if models differ)
    const catalog = booking.catalogId
      ? await PujaCatalog.findById(booking.catalogId).lean()
      : null;

    const priestService = booking.priestServiceId
      ? await PriestService.findById(booking.priestServiceId).lean()
      : null;

    const priestProfile = booking.priestId
      ? await PriestProfile.findOne({ userId: booking.priestId }).lean()
      : null;

    return NextResponse.json(
      {
        ok: true,
        booking,
        catalog,
        priestService,
        priestProfile,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
