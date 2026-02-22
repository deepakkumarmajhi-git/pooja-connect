"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ApiResponse = {
  ok: boolean;
  error?: string;
  booking?: any;
  catalog?: any;
  priestService?: any;
  priestProfile?: any;
};

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function money(n: any) {
  const num = Number(n || 0);
  return `₹${num.toFixed(0)}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = String(status || "").toUpperCase();
  const label =
    s === "PENDING_PRIEST"
      ? "Pending priest confirmation"
      : s === "CONFIRMED"
        ? "Confirmed"
        : s === "COMPLETED"
          ? "Completed"
          : s === "CANCELLED"
            ? "Cancelled"
            : s === "REJECTED"
              ? "Rejected"
              : s || "Unknown";
  const variant =
    s === "CONFIRMED"
      ? "success"
      : s === "COMPLETED"
        ? "secondary"
        : s === "CANCELLED" || s === "REJECTED"
          ? "destructive"
          : "warning";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
        variant === "success"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
          : variant === "destructive"
            ? "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-400"
            : variant === "warning"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-400"
              : "border-slate-500/30 bg-slate-500/10 text-slate-800 dark:text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!bookingId) {
          setError("Missing booking id");
          return;
        }

        const res = await fetch(`/api/bookings/${bookingId}`, { cache: "no-store" });
        const json = (await res.json()) as ApiResponse;

        if (!res.ok || json?.ok === false) {
          setError(json?.error || "Failed to load booking");
          return;
        }

        setData(json);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [bookingId]);

  const booking = data?.booking;
  const catalog = data?.catalog;
  const addons = useMemo(() => booking?.addons ?? [], [booking]);
  const pricing = booking?.pricing ?? {};

  if (loading) {
    return (
      <div className="container-main py-10">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-main py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-400">Booking</h1>
          <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Retry
            </button>
            <Link
              href="/dashboard/customer"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pujaName = catalog?.title || catalog?.name || booking?.catalogSlug || "Puja";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-black via-neutral-950 to-black">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs text-neutral-400">Booking</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{pujaName}</h1>
            <p className="mt-2 text-sm text-neutral-300">
              Booking ID: <span className="font-mono text-neutral-200">{String(booking?._id)}</span>
            </p>
            <div className="mt-3">
              <StatusBadge status={booking?.status} />
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/pujas"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Book another
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Schedule</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs text-neutral-400">Date & Time</p>
                  <p className="mt-1 text-white font-medium">
                    {booking?.scheduledAt ? formatDateTime(booking.scheduledAt) : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs text-neutral-400">Mode</p>
                  <p className="mt-1 text-white font-medium">{booking?.mode || "—"}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Address</h2>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-white">
                  {(booking?.city || "—") + (booking?.area ? `, ${booking.area}` : "")}
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  {booking?.fullAddress || "—"}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Notes</h2>
              <p className="mt-3 text-sm text-neutral-300">
                {booking?.notes?.trim() ? booking.notes : "No special notes."}
              </p>
            </div>

            {/* Addons */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Add-ons</h2>
              {addons.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-300">No add-ons selected.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {addons.map((a: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{a.label || a.key}</p>
                        {a?.meta?.distanceKm ? (
                          <p className="text-xs text-neutral-400">
                            Distance: {a.meta.distanceKm} km
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm text-white">{money(a.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: pricing */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Pricing</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-neutral-300">Service price</span>
                  <span className="text-white">{money(pricing.servicePrice)}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-neutral-300">Add-ons</span>
                  <span className="text-white">{money(pricing.addonsTotal)}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-neutral-300">Platform fee</span>
                  <span className="text-white">{money(pricing.platformFee)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-xl bg-white p-3">
                  <span className="font-medium text-black">Total</span>
                  <span className="font-bold text-black">{money(pricing.total)}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                Priest earning estimate: {money(pricing.priestEarningEstimate)}
              </p>
            </div>

            {/* Helpful box */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">What happens next?</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>• Your booking is sent to the priest for confirmation.</li>
                <li>• You’ll get updates in Notifications.</li>
                <li>• After confirmation, your booking status becomes “Confirmed”.</li>
              </ul>
              <Link
                href="/notifications"
                className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
              >
                View Notifications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
