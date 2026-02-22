"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RequestItem = { _id: string; bookingId?: string; status?: string };

export default function PriestRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setMsg("");
    setLoading(true);
    const res = await fetch("/api/priest/requests", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to load requests");
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
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
        Booking Requests
      </h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Accept or decline incoming requests.
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
              <CardHeader>
                <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <p className="py-6 text-center text-[var(--muted-foreground)]">
              No requests right now.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4">
          {items.map((r) => (
            <li key={String(r._id)}>
              <Card>
                <CardHeader className="pb-2">
                  <p className="font-semibold">Request: {String(r.bookingId)}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Status: {r.status}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => accept(String(r._id))}>Accept</Button>
                    <Button variant="outline" onClick={() => decline(String(r._id))}>
                      Decline
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
