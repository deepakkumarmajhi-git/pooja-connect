import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const body = await req.json();
  const action = String(body.action || "").toUpperCase(); // APPROVE | REJECT | SUSPEND
  const reviewNotes = String(body.reviewNotes || "").trim();

  const nextStatus =
    action === "APPROVE" ? "APPROVED" :
    action === "REJECT" ? "REJECTED" :
    action === "SUSPEND" ? "SUSPENDED" :
    null;

  if (!nextStatus) {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }

  await connectDB();

  const updated = await PriestProfile.findByIdAndUpdate(
    id,
    {
      $set: {
        approvalStatus: nextStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
    },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Priest profile not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile: updated });
}
