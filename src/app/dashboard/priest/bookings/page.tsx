"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Booking = Record<string, unknown>;

export default function PriestBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setMsg("");
    setLoading(true);
    const res = await fetch("/api/priest/bookings", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load bookings");
      setItems([]);
    } else {
      setItems(data.items || []);
    }
    setLoading(false);
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

  const statusVariant = (s: string) => {
    const u = String(s).toUpperCase();
    if (u === "CONFIRMED") return "success";
    if (u === "COMPLETED") return "secondary";
    if (u === "CANCELLED" || u === "REJECTED") return "destructive";
    return "warning";
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Bookings</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        View and accept booking requests.
      </p>

      {msg ? (
        <div
          className="mt-6 rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm dark:bg-slate-800"
          role="alert"
        >
          {msg}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-[var(--muted-foreground)]">
            No bookings yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4">
          {items.map((b: Booking) => (
            <li key={String(b._id)}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{String(b.catalogSlug)}</span>
                    <Badge variant={statusVariant(String(b.status))}>{String(b.status)}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Mode: {String(b.mode)} • Scheduled:{" "}
                    {b.scheduledAt ? new Date(b.scheduledAt as string).toLocaleString() : "—"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Total: ₹{(b.pricing as { total?: number })?.total ?? "—"} • Payment:{" "}
                    {(b.payment as { status?: string })?.status ?? "—"}
                  </p>
                  {String(b.status) === "PENDING_PRIEST" ? (
                    <Button
                      className="mt-4"
                      onClick={() => accept(String(b._id))}
                    >
                      Accept Booking
                    </Button>
                  ) : null}
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
