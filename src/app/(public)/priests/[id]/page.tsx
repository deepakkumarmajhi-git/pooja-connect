import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getPriestDetails(id: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/priests/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed (${res.status}): ${text}`);
  }
  return res.json();
}

export default async function PriestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getPriestDetails>>;
  try {
    data = await getPriestDetails(id);
  } catch (e) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Priest not found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {e instanceof Error ? e.message : "Failed to load priest."}
        </p>
        <Link href="/priests" className="mt-6 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to Priests
          </Button>
        </Link>
      </div>
    );
  }

  const priest = data?.priest;
  const services = data?.services ?? [];
  const user = priest?.user;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/priests"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Priests
      </Link>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {user?.name ?? "Priest"}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            {priest?.city ? `${priest.city}, ` : ""}
            {priest?.state ?? ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {priest?.experienceYears != null && (
              <Badge variant="secondary">{priest.experienceYears}+ yrs experience</Badge>
            )}
            {Array.isArray(priest?.languages) && priest.languages.length > 0 && (
              <Badge variant="outline">Languages: {priest.languages.join(", ")}</Badge>
            )}
          </div>
        </div>

        <Card className="w-full shrink-0 md:w-[320px]">
          <CardHeader className="pb-2">
            <p className="text-sm text-[var(--muted-foreground)]">Ready to book?</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={`/book?priestId=${id}`}>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" aria-hidden />
                Book Now
              </Button>
            </Link>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Choose puja + date/time on next page.
            </p>
          </CardContent>
        </Card>
      </div>

      <hr className="my-8 border-[var(--border)]" />

      <h2 className="text-xl font-semibold text-[var(--foreground)]">Services</h2>

      {services.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-[var(--muted-foreground)]">
            No services added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s: { _id: string; title?: string; name?: string; description?: string; price?: number }) => (
            <Card key={s._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {s.title ?? s.name ?? "Service"}
                    </p>
                    {s.description ? (
                      <p className="mt-1 line-clamp-3 text-sm text-[var(--muted-foreground)]">
                        {s.description}
                      </p>
                    ) : null}
                  </div>
                  {s.price != null ? (
                    <Badge variant="secondary" className="shrink-0">
                      ₹{s.price}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
