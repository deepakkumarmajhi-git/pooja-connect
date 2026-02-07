import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PriestProfile from "@/models/PriestProfile";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "PRIEST") {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const user: any = await User.findById(session.user.id).lean();
    if (!user) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const profile: any = await PriestProfile.findOne({ userId: session.user.id }).lean();

    return NextResponse.json({
        ok: true,
        priest: {
            priestId: String(user._id),
            name: user.name || "",
            email: user.email || "",
            role: user.role || "PRIEST",
            isActive: user.isActive ?? true,
        },
        profile: profile
            ? {
                approvalStatus: profile.approvalStatus,
                city: profile.city || "Bhubaneswar",
                area: profile.area || "",
                bio: profile.bio || "",
                languages: profile.languages || [],
                experienceYears: profile.experienceYears || 0,
                profileImageUrl: profile.profileImageUrl || "",
                phone: profile.phone || "",
            }
            : null,
    });
}
