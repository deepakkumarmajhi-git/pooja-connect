"use client";

import { useEffect, useMemo, useState } from "react";

type CatalogItem = {
  _id: string;
  title: string;
  category: string;
  startingFrom: number;
  modesSupported: ("HOME" | "ONLINE")[];
};

type PriestServiceItem = any;

export default function PriestServicesPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [services, setServices] = useState<PriestServiceItem[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Create service form
  const [catalogId, setCatalogId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [home, setHome] = useState(true);
  const [online, setOnline] = useState(false);

  async function load() {
    setLoading(true);
    setMsg("");

    try {
      const [cRes, sRes] = await Promise.all([
        fetch("/api/catalog", { cache: "no-store" }),
        fetch("/api/priest/services", { cache: "no-store" }),
      ]);

      const cData = await cRes.json();
      const sData = await sRes.json();

      setCatalog(cData.items || []);

      if (!sRes.ok) {
        setMsg(sData?.error || "Unable to load services");
        setServices([]);
      } else {
        setServices(sData.items || []);
      }
    } catch (e: any) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const enabledCatalogIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of services) {
      const id = String(s?.catalogId?._id || s?.catalogId);
      ids.add(id);
    }
    return ids;
  }, [services]);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const modesSupported = [
      ...(home ? ["HOME"] : []),
      ...(online ? ["ONLINE"] : []),
    ];

    if (!catalogId) return setMsg("Select a puja first");
    if (!price || price < 100) return setMsg("Enter valid price");
    if (modesSupported.length === 0) return setMsg("Select at least one mode");

    const res = await fetch("/api/priest/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalogId,
        customPrice: price,
        modesSupported,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to enable service");
      return;
    }

    setMsg("Service enabled ✅");
    setCatalogId("");
    setPrice(0);
    setHome(true);
    setOnline(false);
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/priest/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }
    load();
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>My Services</h1>
      <p style={{ marginTop: 6, color: "#666" }}>
        Enable pujas you offer and set your price. Customers can book only enabled services.
      </p>

      {msg ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
          {msg}
        </div>
      ) : null}

      {/* Enable new service */}
      <form onSubmit={createService} style={{ marginTop: 16, border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Enable a puja</div>

        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Select Puja</div>
            <select
              value={catalogId}
              onChange={(e) => setCatalogId(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
            >
              <option value="">-- Choose --</option>
              {catalog
                .filter((p) => !enabledCatalogIds.has(p._id))
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} (From ₹{p.startingFrom})
                  </option>
                ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Your Price (₹)</div>
            <input
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              placeholder="e.g. 1501"
            />
          </label>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Modes</div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={home} onChange={(e) => setHome(e.target.checked)} />
              HOME
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} />
              ONLINE
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
            Enable Service
          </button>
        </div>
      </form>

      {/* Existing services */}
      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {services.length === 0 ? (
          <div style={{ color: "#666" }}>No services enabled yet.</div>
        ) : (
          services.map((s) => {
            const id = String(s._id);
            const cat = s.catalogId;
            return (
              <div key={id} style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{cat?.title || "Puja"}</div>
                  <div style={{ fontWeight: 900 }}>₹{s.customPrice}</div>
                </div>
                <div style={{ marginTop: 6, color: "#666" }}>
                  Modes: {Array.isArray(s.modesSupported) ? s.modesSupported.join(", ") : "—"}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggleActive(id, Boolean(s.isActive))}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #e5e5e5",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    {s.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
