import Link from "next/link";
import { Clock, MapPin, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CatalogItem = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  defaultDurationMins: number;
  modesSupported: ("HOME" | "ONLINE")[];
  startingFrom: number;
  typicalMin: number;
  typicalMax: number;
};

async function getCatalog(): Promise<CatalogItem[]> {
  const res = await fetch("http://localhost:3000/api/catalog", {
    cache: "no-store",
  });
  const data = await res.json();
  return data.items || [];
}

export default async function PujasPage() {
  let items: CatalogItem[] = [];
  let error: string | null = null;
  try {
    items = await getCatalog();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load catalog";
  }

  const grouped = items.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          Check that the API is running and try again.
        </p>
      </div>
    );
  }

  const categories = Object.keys(grouped);
  const isEmpty = categories.length === 0;

  if (isEmpty) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Puja Catalog</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Browse fixed pujas. Prices may vary by priest; “Starting from” is a guide.
        </p>
        <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--card)] p-12">
          <p className="text-[var(--muted-foreground)]">No pujas in the catalog yet.</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Check back later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
        Puja Catalog
      </h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Browse fixed pujas. Prices may vary by priest; “Starting from” is a guide.
      </p>

      <div className="mt-8 space-y-10">
        {categories.map((cat) => (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <h2 id={`cat-${cat}`} className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              {cat}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[cat].map((p) => (
                <Link
                  key={p._id}
                  href={`/pujas/${p.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-xl"
                >
                  <Card className="h-full transition-shadow hover:shadow-md group-hover:shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <h3 className="font-semibold leading-tight text-[var(--foreground)] group-hover:underline">
                        {p.title}
                      </h3>
                      <span className="shrink-0 font-semibold text-[var(--foreground)]">
                        From ₹{p.startingFrom}
                      </span>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
                        {p.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {p.defaultDurationMins} mins
                        </span>
                        <span>
                          Modes:{" "}
                          {p.modesSupported.includes("HOME") && (
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="h-3.5 w-3.5" aria-hidden /> HOME
                            </span>
                          )}
                          {p.modesSupported.includes("HOME") && p.modesSupported.includes("ONLINE") && " • "}
                          {p.modesSupported.includes("ONLINE") && (
                            <span className="inline-flex items-center gap-0.5">
                              <Monitor className="h-3.5 w-3.5" aria-hidden /> ONLINE
                            </span>
                          )}
                        </span>
                        <span>Typical: ₹{p.typicalMin}–₹{p.typicalMax}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
