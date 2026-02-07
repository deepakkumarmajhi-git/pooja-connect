"use client";

import { useEffect, useState } from "react";

export default function PriestRequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const res = await fetch("/api/priest/requests", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load requests");
      setItems([]);
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function accept(id: string) {
    const res = await fetch(`/api/priest/requests/${id}/accept`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Accept failed");
    load();
  }

  async function decline(id: string) {
    const res = await fetch(`/api/priest/requests/${id}/decline`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Decline failed");
    load();
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Booking Requests</h1>

      {msg ? <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>{msg}</div> : null}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {items.length === 0 ? (
          <div style={{ color: "#666" }}>No requests right now.</div>
        ) : (
          items.map((r) => (
            <div key={String(r._id)} style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
              <div style={{ fontWeight: 900 }}>Request: {String(r.bookingId)}</div>
              <div style={{ marginTop: 6, color: "#666" }}>Status: {r.status}</div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => accept(String(r._id))}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#000", color: "#fff", fontWeight: 900, cursor: "pointer" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => decline(String(r._id))}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e5e5", background: "white", fontWeight: 900, cursor: "pointer" }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
