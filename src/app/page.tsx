import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Calendar, Shield } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "PRIEST") redirect("/dashboard/priest");
    redirect("/dashboard/customer");
  }

  return (
    <div className="flex flex-col">
      <section className="container-main py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
            Book verified priests for pujas
          </h1>
          <p className="mt-5 text-base text-[var(--muted-foreground)] leading-relaxed">
            Choose a puja, pick a priest or let us assign one, and book at home or online.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pujas"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Browse Pujas
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] px-5 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16">
        <div className="container-main">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <BookOpen className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-medium text-[var(--foreground)]">Puja catalog</h3>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Fixed pujas with clear pricing.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Users className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-medium text-[var(--foreground)]">Verified priests</h3>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Approved priests with experience.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-medium text-[var(--foreground)]">Easy booking</h3>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Pick date, add-ons, get confirmed.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Shield className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-medium text-[var(--foreground)]">Transparent</h3>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Clear pricing, no hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-16">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center md:px-12 md:py-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Ready to book?</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Sign in or browse pujas to get started.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pujas"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Browse Pujas
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
