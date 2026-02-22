import Link from "next/link";
import { headers } from "next/headers";
import { MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Priest = {
  priestId: string;
  name: string;
  city: string;
  area: string;
  experienceYears: number;
  languages: string[];
  profileImageUrl?: string;
  bio?: string;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  if (!host) return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${proto}://${host}`;
}

async function getPriests(): Promise<Priest[]> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/priests`, { cache: "no-store" });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) return [];
  const data = await res.json();
  return data.items || [];
}

export default async function PriestsPage() {
  let priests: Priest[] = [];
  let error: string | null = null;
  try {
    priests = await getPriests();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load priests";
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
        Priests
      </h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Verified and approved priests.
      </p>

      {priests.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
            No approved priests found yet. Check back later.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priests.map((p) => (
            <Card key={p.priestId} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-[var(--foreground)]">{p.name}</h2>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {p.experienceYears} yrs exp
                  </span>
                </div>
                <p className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {p.city}{p.area ? `, ${p.area}` : ""}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Languages: {p.languages?.length ? p.languages.join(", ") : "—"}
                </p>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Link href={`/priests/${p.priestId}`}>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <User className="mr-1.5 h-4 w-4" aria-hidden />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
