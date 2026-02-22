import Link from "next/link";
import { Calendar, User, BookOpen } from "lucide-react";

export default function CustomerDashboard() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        View bookings, profile, and browse pujas.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/customer/upcoming" className="group block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">Upcoming Pujas</span>
              <p className="text-xs text-[var(--muted-foreground)]">View and create bookings</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/customer/profile" className="group block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <User className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">Profile</span>
              <p className="text-xs text-[var(--muted-foreground)]">Update your details</p>
            </div>
          </div>
        </Link>

        <Link href="/pujas" className="group block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <BookOpen className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">Browse Pujas</span>
              <p className="text-xs text-[var(--muted-foreground)]">Explore the catalog</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
