"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen } from "lucide-react";

export default function Footer() {
  const { data } = useSession();
  const role = (data?.user as { role?: string })?.role;
  const currentYear = new Date().getFullYear();
  const logoHref = role === "ADMIN" ? "/admin" : role === "PRIEST" ? "/dashboard/priest" : role === "CUSTOMER" ? "/dashboard/customer" : "/";

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] py-8" role="contentinfo">
      <div className="container-main flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Link
          href={logoHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] transition-opacity hover:opacity-80"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          PujaPlatform
        </Link>
        <nav className="flex items-center gap-6" aria-label="Footer">
          <Link href="/pujas" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Pujas
          </Link>
          {role !== "PRIEST" && (
            <Link href="/priests" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Priests
            </Link>
          )}
          <Link href="/auth" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Sign in
          </Link>
        </nav>
        <p className="text-sm text-[var(--muted-foreground)]">
          © {currentYear} PujaPlatform
        </p>
      </div>
    </footer>
  );
}
