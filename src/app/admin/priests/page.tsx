"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error loading priests");
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

  const badgeVariant = (s: string) => {
    if (s === "APPROVED") return "success";
    if (s === "REJECTED" || s === "SUSPENDED") return "destructive";
    return "warning";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Priest Approvals</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Filter by status and approve, reject, or suspend priests.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${status === s ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-transparent" : "border-[var(--border)] bg-[var(--card)] hover:bg-slate-50"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {msg ? (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm dark:bg-slate-800" role="alert">{msg}</div>
      ) : null}

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="py-6"><div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-8"><CardContent className="py-10 text-center text-[var(--muted-foreground)]">No priests in {status}.</CardContent></Card>
      ) : (
        <ul className="mt-8 grid gap-4">
          {items.map((p) => (
            <li key={p.priestProfileId}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{p.name || "Unnamed Priest"}</span>
                    <Badge variant={badgeVariant(p.approvalStatus)}>{p.approvalStatus}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                    <p><strong>Email:</strong> {p.email}</p>
                    <p><strong>Phone:</strong> {p.phone || "—"}</p>
                    <p><strong>Location:</strong> {p.city}, {p.area || "—"}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(p.priestProfileId, "APPROVE")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(p.priestProfileId, "REJECT")}>Reject</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(p.priestProfileId, "SUSPEND")}>Suspend</Button>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">Created: {new Date(p.createdAt).toLocaleString()}</p>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
