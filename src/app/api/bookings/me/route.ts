import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CUSTOMER") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectDB();

  const items = await Booking.find({ customerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, items });
}
