"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Booking = Record<string, unknown>;

export default function CustomerUpcomingPage() {
  const search = useSearchParams();
  const bookSlug = search.get("book") || "";
  const priestServiceId = search.get("service") || "";

  const bookingType = priestServiceId ? "PICK_PRIEST" : "AUTO_ASSIGN";
  const showBookingForm = Boolean(bookSlug);

  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // booking form
  const [mode, setMode] = useState<"HOME" | "ONLINE">("HOME");
  const [scheduledAt, setScheduledAt] = useState("");
  const [city, setCity] = useState("Bhubaneswar");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [notes, setNotes] = useState("");

  // add-ons
  const [extraHavan, setExtraHavan] = useState(false);
  const [samagriIncluded, setSamagriIncluded] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number>(0);

  async function loadBookings() {
    const res = await fetch("/api/bookings/me", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load bookings");
      setItems([]);
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => {
    setLoading(true);
    loadBookings().finally(() => setLoading(false));
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(scheduledAt);
  }, [scheduledAt]);

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!bookSlug) return setMsg("Missing puja slug in URL. Go to a puja page and click Book.");
    if (!canSubmit) return setMsg("Please select date/time");

    // Build payload (only send priestServiceId for PICK_PRIEST)
    const payload: any = {
      bookingType,
      mode,
      catalogSlug: bookSlug,
      scheduledAt,
      city,
      area,
      fullAddress,
      notes,
      extraHavan,
      samagriIncluded,
      assistant,
      streaming,
      distanceKm,
    };

    if (bookingType === "PICK_PRIEST") {
      payload.priestServiceId = priestServiceId;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Booking failed");
      return;
    }

    setMsg(
      bookingType === "PICK_PRIEST"
        ? "Booking created ✅ (waiting for priest acceptance)"
        : "Booking created ✅ (sent to priests — waiting for someone to accept)"
    );

    // reset some fields
    setNotes("");
    setExtraHavan(false);
    setSamagriIncluded(false);
    setAssistant(false);
    setStreaming(false);
    setDistanceKm(0);

    loadBookings();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Upcoming Pujas</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Create a booking or view your existing bookings.</p>

      {msg ? (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm dark:bg-slate-800" role="alert">
          {msg}
        </div>
      ) : null}

      {showBookingForm ? (
        <div style={{ marginTop: 16, border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Create booking for: <span style={{ fontWeight: 800 }}>{bookSlug}</span>
          </div>

          <div style={{ marginBottom: 10, color: "#666" }}>
            Booking type: <b>{bookingType}</b>
            {bookingType === "PICK_PRIEST" ? " (Priest selected)" : " (Auto assign to eligible priests)"}
          </div>

          <form onSubmit={createBooking} style={{ display: "grid", gap: 10 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Mode</div>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              >
                <option value="HOME">HOME</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </label>

            <label>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Date & Time</div>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                required
              />
            </label>

            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <label>
                <div style={{ fontSize: 13, fontWeight: 800 }}>City</div>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                />
              </label>
              <label>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Area</div>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                />
              </label>
            </div>

            {mode === "HOME" ? (
              <>
                <label>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Full Address</div>
                  <input
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                    placeholder="House no, street, landmark"
                  />
                </label>

                <label>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Distance (km) (MVP)</div>
                  <input
                    type="number"
                    value={distanceKm || ""}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                    placeholder="e.g. 7"
                  />
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    First 5 km free, extra km charged.
                  </div>
                </label>
              </>
            ) : null}

            <label>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Notes</div>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
                placeholder="Any special request"
              />
            </label>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Add-ons</div>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={extraHavan} onChange={(e) => setExtraHavan(e.target.checked)} />
                Extra Havan
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <input type="checkbox" checked={samagriIncluded} onChange={(e) => setSamagriIncluded(e.target.checked)} />
                Samagri included
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <input type="checkbox" checked={assistant} onChange={(e) => setAssistant(e.target.checked)} />
                Additional priest / assistant
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <input type="checkbox" checked={streaming} onChange={(e) => setStreaming(e.target.checked)} />
                Live streaming / recorded video (ONLINE)
              </label>
            </div>

            <button
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#000",
                color: "#fff",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
              }}
            >
              Create Booking
            </button>
          </form>
        </div>
      ) : (
        <div style={{ marginTop: 12, color: "#666" }}>
          To book a puja: open a puja details page → click “Book with this priest” or “Auto-assign”.
        </div>
      )}

      <section className="mt-10" aria-labelledby="my-bookings">
        <h2 id="my-bookings" className="text-lg font-semibold text-[var(--foreground)]">My Bookings</h2>
        {loading ? (
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] py-10 text-center text-[var(--muted-foreground)]">No bookings yet.</div>
        ) : (
          <ul className="mt-4 grid gap-4">
            {items.map((b: Booking) => (
              <li key={String(b._id)} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{String(b.catalogSlug)}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium dark:bg-slate-800">{String(b.status)}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Mode: {String(b.mode)} • Scheduled: {b.scheduledAt ? new Date(b.scheduledAt as string).toLocaleString() : "—"}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Total: ₹{(b.pricing as { total?: number })?.total ?? "—"} • Payment: {(b.payment as { status?: string })?.status ?? "—"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
