import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PujaCatalog from "@/models/PujaCatalog";
import PriestService from "@/models/PriestService";
import PriestProfile from "@/models/PriestProfile";
import User from "@/models/User";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

  const catalog = await PujaCatalog.findOne({ slug, isActive: true }).lean();
  if (!catalog) {
    return NextResponse.json({ ok: false, error: "Puja not found" }, { status: 404 });
  }

  // Find services for this puja
  const services = await PriestService.find({ catalogId: catalog._id, isActive: true }).lean();
  const priestIds = services.map((s: any) => s.priestId);

  // Only approved priests
  const approvedProfiles = await PriestProfile.find({
    userId: { $in: priestIds },
    approvalStatus: "APPROVED",
  }).lean();
  const approvedSet = new Set(approvedProfiles.map((p: any) => String(p.userId)));

  const users = await User.find({ _id: { $in: priestIds }, role: "PRIEST", isActive: true }).lean();
  const userMap = new Map(users.map((u: any) => [String(u._id), u]));
  const profileMap = new Map(approvedProfiles.map((p: any) => [String(p.userId), p]));

  const items = services
    .filter((s: any) => approvedSet.has(String(s.priestId)))
    .map((s: any) => {
      const u = userMap.get(String(s.priestId));
      const p = profileMap.get(String(s.priestId));
      return {
        priestServiceId: String(s._id),
        priestId: String(s.priestId),
        name: u?.name || "Priest",
        city: p?.city || "Bhubaneswar",
        area: p?.area || "",
        experienceYears: p?.experienceYears || 0,
        languages: p?.languages || [],
        price: s.customPrice,
        modesSupported: s.modesSupported || ["HOME"],
      };
    })
    .sort((a: any, b: any) => a.price - b.price);

  return NextResponse.json({ ok: true, catalogId: String(catalog._id), items });
}
