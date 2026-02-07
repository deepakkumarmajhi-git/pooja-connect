import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  // Case-insensitive APPROVED match (handles "approved", "Approved", etc.)
  const profiles: any[] = await PriestProfile.find({
    approvalStatus: { $regex: /^APPROVED$/i },
  })
    .sort({ updatedAt: -1 })
    .lean();

  // Some projects store priest reference as userId, some as priestId.
  // We'll accept either to avoid mismatch.
  const rawIds = profiles
    .map((p) => p.userId ?? p.priestId ?? p.priestUserId)
    .filter(Boolean)
    .map((x) => String(x));

  // Find users for those ids
  const users: any[] = await User.find({
    _id: { $in: rawIds },
    // don't over-restrict here; role/case might differ in DB
  }).lean();

  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const items = profiles
    .map((p) => {
      const id = String(p.userId ?? p.priestId ?? p.priestUserId ?? "");
      const u = userMap.get(id);

      // If user missing, skip from public list, but show in debug
      if (!u) return debug ? { _debug_missingUser: true, profile: p } : null;

      // Only show priests publicly (handle case differences)
      const role = String(u.role || "").toUpperCase();
      if (role !== "PRIEST") {
        return debug ? { _debug_wrongRole: role, user: u, profile: p } : null;
      }

      // isActive may not exist in your User schema; do not filter hard
      return {
        priestId: String(u._id),
        name: u.name || "Priest",
        city: p.city || "Bhubaneswar",
        area: p.area || "",
        experienceYears: p.experienceYears || 0,
        languages: p.languages || [],
        profileImageUrl: p.profileImageUrl || "",
        bio: p.bio || "",
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    ok: true,
    items,
    ...(debug
      ? {
          debug: {
            profilesApproved: profiles.length,
            idsExtracted: rawIds.length,
            usersMatched: users.length,
            note:
              "If profilesApproved > 0 but usersMatched == 0, your PriestProfile reference field isn't userId/priestId or contains wrong values.",
          },
        }
      : {}),
  });
}
