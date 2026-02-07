"use client";

import { useEffect, useState } from "react";

type Booking = any;

export default function PriestBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const res = await fetch("/api/priest/bookings", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load bookings");
      setItems([]);
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function accept(id: string) {
    const res = await fetch(`/api/priest/bookings/${id}/accept`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Accept failed");
      return;
    }
    load();
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Bookings</h1>

      {msg ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
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

              {b.status === "PENDING_PRIEST" ? (
                <button
                  onClick={() => accept(String(b._id))}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#000",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Accept Booking
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Priest bookings UI (accept button)