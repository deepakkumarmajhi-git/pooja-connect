"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Booking = any;

export default function CustomerUpcomingPage() {
  const search = useSearchParams();
  const bookSlug = search.get("book") || "";
  const priestServiceId = search.get("service") || "";

  const bookingType = priestServiceId ? "PICK_PRIEST" : "AUTO_ASSIGN";
  const showBookingForm = Boolean(bookSlug); // show for both pick-priest + auto-assign

  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");

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
    loadBookings();
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
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Upcoming Pujas</h1>

      {msg ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
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

      <div style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900 }}>My Bookings</h2>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ color: "#666" }}>No bookings yet.</div>
          ) : (
            items.map((b: any) => (
              <div key={String(b._id)} style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{b.catalogSlug}</div>
                  <div style={{ fontWeight: 900 }}>{b.status}</div>
                </div>
                <div style={{ marginTop: 6, color: "#444" }}>
                  Mode: {b.mode} • Scheduled: {new Date(b.scheduledAt).toLocaleString()}
                </div>
                <div style={{ marginTop: 6, color: "#666" }}>
                  Total: ₹{b?.pricing?.total} • Payment: {b?.payment?.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
