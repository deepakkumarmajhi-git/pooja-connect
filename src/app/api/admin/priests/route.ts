import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PriestProfile from "@/models/PriestProfile";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectDB();

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "PENDING").toUpperCase();

  const profiles = await PriestProfile.find({ approvalStatus: status })
    .sort({ createdAt: -1 })
    .lean();

  const userIds = profiles.map((p: any) => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();

  const userMap = new Map(users.map((u: any) => [String(u._id), u]));

  const items = profiles.map((p: any) => {
    const u = userMap.get(String(p.userId));
    return {
      priestProfileId: String(p._id),
      userId: String(p.userId),
      approvalStatus: p.approvalStatus,
      createdAt: p.createdAt,
      name: u?.name || "",
      email: u?.email || "",
      phone: u?.phone || "",
      city: p.city || "Bhubaneswar",
      area: p.area || "",
    };
  });

  return NextResponse.json({ ok: true, items });
}
