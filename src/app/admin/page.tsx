import Link from "next/link";
import { Users, BookOpen, Calendar, Wallet } from "lucide-react";

const links = [
  { href: "/admin/priests", label: "Priest Approvals", description: "Approve or reject priest accounts", icon: Users },
  { href: "/admin/catalog", label: "Puja Catalog", description: "Manage puja catalog", icon: BookOpen },
  { href: "/admin/bookings", label: "Bookings", description: "Monitor all bookings", icon: Calendar },
  { href: "/admin/payouts", label: "Payments & Payouts", description: "Payouts and payments", icon: Wallet },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Approve priests, manage catalog, monitor bookings and payouts.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {links.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <div>
                <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">{label}</span>
                <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
