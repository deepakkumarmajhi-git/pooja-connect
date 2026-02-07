import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import PriestService from "@/models/PriestService";

export async function PATCH(
  req: Request,
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

  const body = await req.json();

  const update: any = {};
  if (body.customPrice !== undefined) update.customPrice = Number(body.customPrice);
  if (body.modesSupported !== undefined) update.modesSupported = body.modesSupported;
  if (body.customDescription !== undefined) update.customDescription = String(body.customDescription);
  if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);

  const updated = await PriestService.findOneAndUpdate(
    { _id: id, priestId: session.user.id },
    { $set: update },
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });

  return NextResponse.json({ ok: true, service: updated });
}
