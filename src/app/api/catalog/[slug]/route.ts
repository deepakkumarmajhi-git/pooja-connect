import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PujaCatalog from "@/models/PujaCatalog";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug: rawSlug } = await context.params;

    const slug = decodeURIComponent(rawSlug || "").trim().toLowerCase();

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Slug missing" }, { status: 400 });
    }

    const item = await PujaCatalog.findOne({
      isActive: true,
      slug: { $regex: `^${slug}$`, $options: "i" },
    }).lean();

    if (!item) {
      return NextResponse.json({ ok: false, error: "Puja not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch puja" },
      { status: 500 }
    );
  }
}
