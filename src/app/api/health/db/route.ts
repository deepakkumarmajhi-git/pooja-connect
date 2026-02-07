import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      { ok: true, message: "MongoDB connected successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: "MongoDB connection failed", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
