import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Monitor, User, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

type PriestItem = {
  priestServiceId: string;
  priestId: string;
  name: string;
  city: string;
  area: string;
  experienceYears: number;
  languages: string[];
  price: number;
  modesSupported: ("HOME" | "ONLINE")[];
};

async function getPuja(slug: string): Promise<CatalogItem | null> {
  const res = await fetch(`http://localhost:3000/api/catalog/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.item || null;
}

async function getPriestsForPuja(slug: string): Promise<PriestItem[]> {
  const res = await fetch(`http://localhost:3000/api/pujas/${slug}/priests`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export default async function PujaDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [puja, priests] = await Promise.all([getPuja(slug), getPriestsForPuja(slug)]);

  if (!puja) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Puja not found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          The puja you’re looking for doesn’t exist or has been removed.
        </p>
        <Link href="/pujas" className="mt-6 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to Pujas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/pujas"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Pujas
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)]">
        {puja.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <Badge variant="secondary">{puja.category}</Badge>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden />
          {puja.defaultDurationMins} mins
        </span>
        <span>
          Modes:{" "}
          {puja.modesSupported.map((m) => (
            <span key={m} className="inline-flex items-center gap-1">
              {m === "HOME" ? <MapPin className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
              {m}
            </span>
          ))}
        </span>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-lg font-semibold">Starting from ₹{puja.startingFrom}</span>
            <span className="text-sm text-[var(--muted-foreground)]">
              Typical range: ₹{puja.typicalMin}–₹{puja.typicalMax}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[var(--muted-foreground)] leading-relaxed">{puja.description}</p>
        </CardContent>
      </Card>

      <section className="mt-10" aria-labelledby="priests-heading">
        <h2 id="priests-heading" className="text-xl font-semibold text-[var(--foreground)]">
          Priests offering this puja
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pick a priest to book directly, or choose auto-assign from dashboard booking.
        </p>

        {priests.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-10 text-center text-[var(--muted-foreground)]">
              No approved priests have enabled this puja yet. Check back later.
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {priests.map((p) => (
              <li key={p.priestServiceId}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{p.name}</h3>
                      <span className="font-semibold">₹{p.price}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {p.city}{p.area ? `, ${p.area}` : ""} • {p.experienceYears} yrs exp
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Modes: {p.modesSupported.join(", ")} • Languages:{" "}
                      {p.languages?.length ? p.languages.join(", ") : "—"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    <Link
                      href={`/dashboard/customer/upcoming?book=${puja.slug}&service=${p.priestServiceId}`}
                    >
                      <Button size="sm">
                        <Wallet className="mr-1.5 h-4 w-4" aria-hidden />
                        Book with this priest
                      </Button>
                    </Link>
                    <Link href={`/priests/${p.priestId}`}>
                      <Button variant="outline" size="sm">
                        <User className="mr-1.5 h-4 w-4" aria-hidden />
                        View profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <Link href={`/dashboard/customer/upcoming?book=${puja.slug}`}>
            <Button variant="outline">Auto-assign (fast)</Button>
          </Link>
        </div>
      </section>

      <Card className="mt-10">
        <CardHeader>
          <h2 className="text-lg font-semibold">Optional add-ons</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--muted-foreground)]">
            <li>Extra Havan</li>
            <li>Samagri included</li>
            <li>Additional priest / assistant</li>
            <li>Live streaming / recorded video (for ONLINE)</li>
            <li>Travel fee (for HOME): first 5 km free</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
