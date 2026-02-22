"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type CatalogItem = {
  _id: string;
  title: string;
  category: string;
  startingFrom: number;
  modesSupported: ("HOME" | "ONLINE")[];
};

type PriestServiceItem = {
  _id: string;
  customPrice?: number;
  modesSupported?: string[];
  isActive?: boolean;
  catalogId?: { _id: string; title?: string } | string;
};

export default function PriestServicesPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [services, setServices] = useState<PriestServiceItem[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
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
      const id = String(
        typeof s?.catalogId === "object" ? s?.catalogId?._id : s?.catalogId
      );
      if (id) ids.add(id);
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
    if (!price || price < 100) return setMsg("Enter valid price (min 100)");
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

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  const getTitle = (s: PriestServiceItem) => {
    const cat = s.catalogId;
    if (typeof cat === "object" && cat?.title) return cat.title;
    return "Puja";
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
        My Services
      </h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Enable pujas you offer and set your price. Customers can book only enabled services.
      </p>

      {msg ? (
        <div
          className="mt-6 rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm dark:bg-slate-800"
          role="alert"
        >
          {msg}
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Enable a puja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createService} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Select Puja</span>
              <select
                value={catalogId}
                onChange={(e) => setCatalogId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label="Select puja"
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

            <label className="block">
              <span className="text-sm font-medium">Your Price (₹)</span>
              <Input
                type="number"
                className="mt-1"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="e.g. 1501"
              />
            </label>

            <div>
              <span className="text-sm font-medium">Modes</span>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={home} onChange={(e) => setHome(e.target.checked)} />
                  HOME
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} />
                  ONLINE
                </label>
              </div>
            </div>

            <Button type="submit">Enable Service</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mt-10 text-lg font-semibold text-[var(--foreground)]">Your services</h2>

      {services.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-[var(--muted-foreground)]">
            No services enabled yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-4 grid gap-4">
          {services.map((s) => {
            const id = String(s._id);
            return (
              <li key={id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{getTitle(s)}</span>
                      <span className="font-semibold">₹{s.customPrice}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Modes: {Array.isArray(s.modesSupported) ? s.modesSupported.join(", ") : "—"}
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(id, Boolean(s.isActive))}
                      >
                        {s.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
