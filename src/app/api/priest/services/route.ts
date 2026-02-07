import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import PriestService from "@/models/PriestService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "PRIEST") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectDB();

  const profile = await PriestProfile.findOne({ userId: session.user.id }).lean();
  if (!profile || profile.approvalStatus !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Priest not approved yet" }, { status: 403 });
  }

  const items = await PriestService.find({ priestId: session.user.id })
    .populate("catalogId")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "PRIEST") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectDB();

  const profile = await PriestProfile.findOne({ userId: session.user.id }).lean();
  if (!profile || profile.approvalStatus !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Priest not approved yet" }, { status: 403 });
  }

  const body = await req.json();
  const catalogId = String(body.catalogId || "");
  const customPrice = Number(body.customPrice || 0);
  const modesSupported = Array.isArray(body.modesSupported) ? body.modesSupported : ["HOME"];
  const customDescription = String(body.customDescription || "");

  if (!catalogId || !customPrice || customPrice < 100) {
    return NextResponse.json({ ok: false, error: "Invalid catalogId or price" }, { status: 400 });
  }

  try {
    const created = await PriestService.create({
      priestId: session.user.id,
      catalogId,
      customPrice,
      modesSupported,
      customDescription,
      isActive: true,
    });

    return NextResponse.json({ ok: true, service: created }, { status: 201 });
  } catch (e: any) {
    // Duplicate key => already enabled
    if (e?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Service already enabled" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: e?.message || "Failed to create service" }, { status: 500 });
  }
}
