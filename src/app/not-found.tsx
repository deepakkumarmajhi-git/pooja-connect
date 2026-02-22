import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center py-16">
      <FileQuestion className="h-16 w-16 text-[var(--muted-foreground)]" aria-hidden />
      <h1 className="mt-6 text-3xl font-bold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-center text-[var(--muted-foreground)]">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
      >
        Back to home
      </Link>
    </div>
  );
}
