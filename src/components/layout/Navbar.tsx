"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { BookOpen, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = (data?.user as { role?: "CUSTOMER" | "PRIEST" | "ADMIN" })?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref =
    role === "ADMIN"
      ? "/admin"
      : role === "PRIEST"
        ? "/dashboard/priest"
        : "/dashboard/customer";

  const navLinks = [
    { href: "/pujas", label: "Pujas" },
    ...(role !== "PRIEST" ? [{ href: "/priests", label: "Priests" }] : []),
    ...(role ? [{ href: dashboardHref, label: "Dashboard" }] : []),
    { href: "/settings", label: "Settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80"
      role="banner"
    >
      <div className="container-main flex h-14 items-center justify-between gap-4">
        <Link
          href={role ? dashboardHref : "/"}
          className="flex items-center gap-2 font-semibold text-[var(--foreground)] tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md transition-opacity hover:opacity-80"
          aria-label="PujaPlatform home"
        >
          <BookOpen className="h-6 w-6" aria-hidden />
          <span className="hidden sm:inline">PujaPlatform</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ${
                isActive(href)
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {role ? (
            <>
              <span className="hidden sm:inline max-w-[140px] truncate text-sm text-[var(--muted-foreground)]" title={data?.user?.email ?? ""}>
                {data?.user?.email}
              </span>
              <span className="hidden sm:inline rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                {role}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth" })}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4 md:mr-1" aria-hidden />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link
                href="/auth"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden border-t border-[var(--border)] bg-[var(--card)] ${mobileOpen ? "block" : "hidden"}`}
        aria-hidden={!mobileOpen}
      >
        <nav className="container-main flex flex-col py-4 gap-1" aria-label="Mobile navigation">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                isActive(href)
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
