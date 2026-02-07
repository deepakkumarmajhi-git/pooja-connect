import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PujaCatalog from "@/models/PujaCatalog";

export async function GET() {
  try {
    await connectDB();

    const items = await PujaCatalog.find({ isActive: true })
      .sort({ category: 1, title: 1 })
      .lean();

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
