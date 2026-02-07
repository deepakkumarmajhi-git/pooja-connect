import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import BookingRequest from "@/models/BookingRequest";

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

  const updated = await BookingRequest.findOneAndUpdate(
    { _id: id, priestId: session.user.id, status: "PENDING" },
    { $set: { status: "DECLINED" } },
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ ok: false, error: "Request not found/expired" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
