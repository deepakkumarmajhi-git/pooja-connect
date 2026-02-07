import Link from "next/link";
import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers(); // ✅ Next 15/16 requires await
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getPriestDetails(id: string) {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/priests/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed (${res.status}): ${text}`);
  }

  return res.json();
}

export default async function PriestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getPriestDetails(params.id);

  const priest = data?.priest;
  const services = data?.services ?? [];
  const user = priest?.user;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user?.name ?? "Priest"}</h1>
          <p className="text-sm text-muted-foreground">
            {priest?.city ? `${priest.city}, ` : ""}
            {priest?.state ?? ""}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {priest?.experienceYears != null && (
              <span className="rounded-full border px-3 py-1">
                {priest.experienceYears}+ yrs experience
              </span>
            )}
            {Array.isArray(priest?.languages) && priest.languages.length > 0 && (
              <span className="rounded-full border px-3 py-1">
                Languages: {priest.languages.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4 shadow-sm md:w-[320px]">
          <p className="text-sm text-muted-foreground">Ready to book?</p>
          <Link
            href={`/book?priestId=${params.id}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-white"
          >
            Book Now
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Choose puja + date/time on next page.
          </p>
        </div>
      </div>

      <hr className="my-8" />

      <h2 className="text-xl font-semibold">Services</h2>

      {services.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No services added yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => (
            <div key={s._id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{s.title ?? s.name ?? "Service"}</p>
                  {s.description ? (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {s.description}
                    </p>
                  ) : null}
                </div>

                {s.price != null ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    ₹{s.price}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
