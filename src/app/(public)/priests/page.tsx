import { headers } from "next/headers";

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
  const h = await headers(); // IMPORTANT: headers() is async in your Next.js version
  const host = h.get("host"); // e.g. localhost:3000
  const proto = h.get("x-forwarded-proto") || "http";

  // Fallbacks (important in dev / edge cases)
  if (!host) return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${proto}://${host}`;
}

async function getPriests(): Promise<Priest[]> {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/priests`, {
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) return [];

  const data = await res.json();
  return data.items || [];
}

export default async function PriestsPage() {
  const priests = await getPriests();

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Priests</h1>
      <p style={{ marginTop: 6, color: "#666" }}>Verified and approved priests.</p>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {priests.length === 0 ? (
          <div style={{ color: "#666" }}>No approved priests found yet.</div>
        ) : (
          priests.map((p) => (
            <div
              key={p.priestId}
              style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>{p.name}</div>
                <div style={{ color: "#444" }}>{p.experienceYears} yrs exp</div>
              </div>

              <div style={{ marginTop: 6, color: "#666" }}>
                {p.city}{p.area ? `, ${p.area}` : ""}
              </div>

              <div style={{ marginTop: 6, color: "#666" }}>
                Languages: {p.languages?.length ? p.languages.join(", ") : "—"}
              </div>

              <div style={{ marginTop: 10 }}>
                <a
                  href={`/priests/${p.priestId}`}
                  style={{
                    textDecoration: "none",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e5e5",
                    fontWeight: 900,
                    color: "black",
                    display: "inline-block",
                  }}
                >
                  View Profile
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
