"use client";

import { useEffect, useState } from "react";

type PriestItem = {
  priestProfileId: string;
  userId: string;
  approvalStatus: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  area: string;
};

export default function AdminPriestsPage() {
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState<PriestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/priests?status=${status}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setItems(data.items || []);
    } catch (e: any) {
      setMsg(e?.message || "Error loading priests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(priestProfileId: string, action: "APPROVE" | "REJECT" | "SUSPEND") {
    const reviewNotes = prompt("Optional notes (press OK to continue):") || "";

    const res = await fetch(`/api/admin/priests/${priestProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }

    // refresh list
    load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Priest Approvals</h1>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e5e5",
              background: status === s ? "#000" : "#fff",
              color: status === s ? "#fff" : "#000",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {msg ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>{msg}</div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 18 }}>Loading...</div>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ color: "#666" }}>No priests in {status}.</div>
          ) : (
            items.map((p) => (
              <div
                key={p.priestProfileId}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{p.name || "Unnamed Priest"}</div>
                  <div style={{ fontWeight: 800 }}>{p.approvalStatus}</div>
                </div>

                <div style={{ color: "#444" }}>
                  <div><b>Email:</b> {p.email}</div>
                  <div><b>Phone:</b> {p.phone || "—"}</div>
                  <div><b>Location:</b> {p.city}, {p.area || "—"}</div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  <button
                    onClick={() => updateStatus(p.priestProfileId, "APPROVE")}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "#0b5", color: "white", fontWeight: 900, cursor: "pointer" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(p.priestProfileId, "REJECT")}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "#d33", color: "white", fontWeight: 900, cursor: "pointer" }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(p.priestProfileId, "SUSPEND")}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5e5", background: "white", color: "black", fontWeight: 900, cursor: "pointer" }}
                  >
                    Suspend
                  </button>
                </div>

                <div style={{ fontSize: 12, color: "#666" }}>
                  Created: {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
