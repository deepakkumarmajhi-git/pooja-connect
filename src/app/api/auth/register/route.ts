import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PriestProfile from "@/models/PriestProfile";
import CustomerProfile from "@/models/CustomerProfile";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "").toUpperCase(); // CUSTOMER | PRIEST

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    if (!["CUSTOMER", "PRIEST"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Admin is NOT created via UI role.
    // Seeded admin: if email matches ADMIN_EMAIL, we mark role ADMIN.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const finalRole = email === adminEmail ? "ADMIN" : role;

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: finalRole,
      isActive: true,
    });

    // Create profile docs depending on role
    if (finalRole === "PRIEST") {
      await PriestProfile.create({ userId: user._id, approvalStatus: "PENDING" });
    } else if (finalRole === "CUSTOMER") {
      await CustomerProfile.create({ userId: user._id });
    }
    // If ADMIN, no extra profile needed.

    return NextResponse.json({ ok: true, message: "Registered successfully" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
