"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Package, User, Image, Inbox, CheckCircle, Clock } from "lucide-react";

export default function PriestDashboard() {
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch("/api/priest/me")
      .then((r) => r.json())
      .then((d) => setStatus(d?.profile?.approvalStatus || "PENDING"))
      .catch(() => setStatus("PENDING"));
  }, []);

  const isApproved = status === "APPROVED";

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Dashboard
      </h1>

      {!isApproved ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-4">
            <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                Approval pending
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Your profile is under admin verification. Once approved, customers can see you and you can accept bookings.
              </p>
            </div>
          </div>
      ) : (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-4">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                You are approved
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                You’re visible to customers and can accept bookings.
              </p>
            </div>
          </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/dashboard/priest/bookings", label: "Bookings", desc: "Manage your bookings", icon: Calendar },
          { href: "/dashboard/priest/services", label: "Services", desc: "Enable pujas and set prices", icon: Package },
          { href: "/dashboard/priest/profile", label: "Profile", desc: "Update your profile", icon: User },
          { href: "/dashboard/priest/media", label: "Media", desc: "Photos and media", icon: Image },
          { href: "/dashboard/priest/requests", label: "Requests", desc: "Booking requests", icon: Inbox },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <div>
                <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">{label}</span>
                <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
