import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PriestProfile from "@/models/PriestProfile";
import PriestService from "@/models/PriestService";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const priest = await PriestProfile.findById(params.id)
      .populate("user", "name email image phone")
      .lean();

    if (!priest) {
      return NextResponse.json(
        { success: false, message: "Priest not found" },
        { status: 404 }
      );
    }

    // Public endpoint: show only approved priests
    const isApproved =
      (priest as any).isApproved === true ||
      (priest as any).approved === true ||
      (priest as any).status === "approved" ||
      (priest as any).verificationStatus === "approved" ||
      (priest as any).approvalStatus === "approved";

    if (!isApproved) {
      return NextResponse.json(
        { success: false, message: "Priest not approved" },
        { status: 403 }
      );
    }

    // Get services for this priest
    const services = await PriestService.find({
      $or: [{ priestProfile: params.id }, { priest: params.id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, priest, services },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load priest details",
        error: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
