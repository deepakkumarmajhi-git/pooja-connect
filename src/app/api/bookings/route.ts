import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import PujaCatalog from "@/models/PujaCatalog";
import PriestService from "@/models/PriestService";
import PriestProfile from "@/models/PriestProfile";
import Booking from "@/models/Booking";
import BookingRequest from "@/models/BookingRequest";

// Simple config for MVP (can move to Admin settings later)
const PLATFORM_FEE = 49; // ₹
const COMMISSION_RATE = 0.12; // 12%
const TRAVEL_FREE_KM = 5;
const TRAVEL_RATE_PER_KM = 20;

function buildAddons(input: any) {
  const addons: any[] = [];

  if (input.extraHavan)
    addons.push({ key: "EXTRA_HAVAN", label: "Extra Havan", price: 701, meta: {} });
  if (input.samagriIncluded)
    addons.push({ key: "SAMAGRI", label: "Samagri included", price: 501, meta: {} });
  if (input.assistant)
    addons.push({ key: "ASSISTANT", label: "Additional priest/assistant", price: 801, meta: {} });
  if (input.streaming)
    addons.push({ key: "STREAMING", label: "Live streaming / recorded video", price: 401, meta: {} });

  // Travel fee (HOME only), uses distanceKm passed from client (MVP)
  const distanceKm = Number(input.distanceKm || 0);
  if (input.mode === "HOME" && distanceKm > TRAVEL_FREE_KM) {
    const extraKm = Math.max(0, distanceKm - TRAVEL_FREE_KM);
    const travelFee = Math.round(extraKm * TRAVEL_RATE_PER_KM);
    addons.push({
      key: "TRAVEL_FEE",
      label: `Travel fee (${distanceKm} km, first ${TRAVEL_FREE_KM} km free)`,
      price: travelFee,
      meta: { distanceKm, freeKm: TRAVEL_FREE_KM, ratePerKm: TRAVEL_RATE_PER_KM },
    });
  }

  return addons;
}

/**
 * ✅ NEW: List bookings for the logged-in CUSTOMER
 * GET /api/bookings?limit=50
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

    const bookings: any[] = await Booking.find({ customerId: session.user.id })
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .lean();

    // Optional enrich: include catalog title/name for UI
    const catalogIds = bookings
      .map((b: any) => b.catalogId)
      .filter(Boolean)
      .map((x: any) => String(x));

    const catalogs: any[] = catalogIds.length
      ? await PujaCatalog.find({ _id: { $in: catalogIds } }).lean()
      : [];

    const catalogMap = new Map(catalogs.map((c: any) => [String(c._id), c]));

    const enriched = bookings.map((b: any) => ({
      ...b,
      catalog: b.catalogId ? catalogMap.get(String(b.catalogId)) ?? null : null,
    }));

    return NextResponse.json({ ok: true, bookings: enriched }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

/**
 * Existing: Create booking
 * POST /api/bookings
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const body = await req.json();

    const bookingType = String(body.bookingType || "").toUpperCase(); // PICK_PRIEST | AUTO_ASSIGN
    const mode = String(body.mode || "").toUpperCase(); // HOME | ONLINE
    const catalogSlug = String(body.catalogSlug || "").trim().toLowerCase();
    const scheduledAt = new Date(body.scheduledAt);

    const city = String(body.city || "Bhubaneswar");
    const area = String(body.area || "");
    const fullAddress = String(body.fullAddress || "");
    const notes = String(body.notes || "");

    const priestServiceId = body.priestServiceId ? String(body.priestServiceId) : null;

    if (!["PICK_PRIEST", "AUTO_ASSIGN"].includes(bookingType)) {
      return NextResponse.json({ ok: false, error: "Invalid bookingType" }, { status: 400 });
    }
    if (!["HOME", "ONLINE"].includes(mode)) {
      return NextResponse.json({ ok: false, error: "Invalid mode" }, { status: 400 });
    }
    if (!catalogSlug) {
      return NextResponse.json({ ok: false, error: "Missing catalogSlug" }, { status: 400 });
    }
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid scheduledAt" }, { status: 400 });
    }

    const catalog: any = await PujaCatalog.findOne({ slug: catalogSlug, isActive: true }).lean();
    if (!catalog) {
      return NextResponse.json({ ok: false, error: "Puja not found" }, { status: 404 });
    }

    // For PICK_PRIEST validate selected priest service
    let service: any = null;
    if (bookingType === "PICK_PRIEST") {
      if (!priestServiceId) {
        return NextResponse.json(
          { ok: false, error: "Missing priestServiceId" },
          { status: 400 }
        );
      }

      service = await PriestService.findOne({
        _id: priestServiceId,
        catalogId: catalog._id,
        isActive: true,
      }).lean();

      if (!service) {
        return NextResponse.json({ ok: false, error: "Service not available" }, { status: 404 });
      }

      const profile = await PriestProfile.findOne({
        userId: service.priestId,
        approvalStatus: "APPROVED",
      }).lean();

      if (!profile) {
        return NextResponse.json({ ok: false, error: "Priest not approved" }, { status: 403 });
      }

      if (!Array.isArray(service.modesSupported) || !service.modesSupported.includes(mode)) {
        return NextResponse.json(
          { ok: false, error: "Selected mode not supported by priest" },
          { status: 400 }
        );
      }
    }

    // Add-ons + pricing snapshot
    const addons = buildAddons({ ...body, mode });
    const addonsTotal = addons.reduce((sum, a) => sum + Number(a.price || 0), 0);

    // AUTO_ASSIGN uses catalog.startingFrom as placeholder until priest accepts
    const servicePrice =
      bookingType === "PICK_PRIEST"
        ? Number(service.customPrice)
        : Number(catalog.startingFrom || 0);

    const total = servicePrice + addonsTotal + PLATFORM_FEE;
    const priestEarningEstimate = Math.round(servicePrice * (1 - COMMISSION_RATE));

    // 1) Create booking first
    const booking: any = await Booking.create({
      customerId: session.user.id,

      priestId: bookingType === "PICK_PRIEST" ? service.priestId : null,
      priestServiceId: bookingType === "PICK_PRIEST" ? service._id : null,

      catalogId: catalog._id,
      catalogSlug,

      bookingType,
      mode,

      scheduledAt,
      city,
      area,
      fullAddress,
      notes,

      status: "PENDING_PRIEST",

      addons,
      pricing: {
        servicePrice,
        addonsTotal,
        platformFee: PLATFORM_FEE,
        total,
        priestEarningEstimate,
      },
    });

    // 2) If AUTO_ASSIGN: create requests for eligible priests
    if (bookingType === "AUTO_ASSIGN") {
      const services = await PriestService.find({
        catalogId: catalog._id,
        isActive: true,
        modesSupported: mode,
      }).lean();

      const priestIds = services.map((s: any) => s.priestId);

      const approved = await PriestProfile.find({
        userId: { $in: priestIds },
        approvalStatus: "APPROVED",
      }).lean();

      const approvedSet = new Set(approved.map((p: any) => String(p.userId)));

      const requests = services
        .filter((s: any) => approvedSet.has(String(s.priestId)))
        .map((s: any) => ({
          bookingId: booking._id,
          priestId: s.priestId,
          priestServiceId: s._id,
          status: "PENDING",
        }));

      if (requests.length) {
        // ignore duplicates safely
        try {
          await BookingRequest.insertMany(requests, { ordered: false });
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, bookingId: String(booking._id) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
