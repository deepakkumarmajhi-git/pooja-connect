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

  const puja = await getPuja(slug);
  const priests = await getPriestsForPuja(slug);

  if (!puja) return <div style={{ padding: 24 }}>Puja not found.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <a href="/pujas" style={{ textDecoration: "none" }}>← Back to Pujas</a>

      <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 12 }}>{puja.title}</h1>

      <div style={{ marginTop: 8, color: "#666" }}>
        Category: <b>{puja.category}</b> • ⏱ {puja.defaultDurationMins} mins • Modes:{" "}
        <b>{puja.modesSupported.join(", ")}</b>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #e5e5e5", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Starting from ₹{puja.startingFrom}</div>
        <div style={{ marginTop: 4, color: "#444" }}>
          Typical range: ₹{puja.typicalMin}–₹{puja.typicalMax}
        </div>
        <p style={{ marginTop: 12, color: "#444", lineHeight: 1.6 }}>{puja.description}</p>
      </div>

      {/* Priests offering this puja */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900 }}>Priests offering this puja</h2>
        <p style={{ marginTop: 6, color: "#666" }}>
          Pick a priest to book directly, or choose auto-assign from dashboard booking (coming next).
        </p>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {priests.length === 0 ? (
            <div style={{ color: "#666" }}>
              No approved priests have enabled this puja yet.
            </div>
          ) : (
            priests.map((p) => (
              <div
                key={p.priestServiceId}
                style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ fontWeight: 900 }}>₹{p.price}</div>
                </div>

                <div style={{ marginTop: 6, color: "#444" }}>
                  {p.city}{p.area ? `, ${p.area}` : ""} • Experience: {p.experienceYears} yrs
                </div>
                <div style={{ marginTop: 6, color: "#666" }}>
                  Modes: {p.modesSupported.join(", ")} • Languages:{" "}
                  {p.languages.length ? p.languages.join(", ") : "—"}
                </div>

                {/* Booking action: redirect to dashboard booking page we will build next */}
                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={`/dashboard/customer/upcoming?book=${puja.slug}&service=${p.priestServiceId}`}
                    style={{
                      textDecoration: "none",
                      background: "black",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 900,
                    }}
                  >
                    Book with this priest
                  </a>

                  <a
                    href={`/priests/${p.priestId}`}
                    style={{
                      textDecoration: "none",
                      border: "1px solid #e5e5e5",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 900,
                      color: "black",
                    }}
                  >
                    View profile
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <a
        href={`/dashboard/customer/upcoming?book=${puja.slug}`}
        style={{
          textDecoration: "none",
          border: "1px solid #e5e5e5",
          padding: "10px 14px",
          borderRadius: 10,
          fontWeight: 900,
          color: "black",
          display: "inline-block",
          marginTop: 10,
        }}
      >
        Auto-assign (fast)
      </a>


      {/* Add-ons preview */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Optional add-ons</h2>
        <ul style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
          <li>Extra Havan</li>
          <li>Samagri included</li>
          <li>Additional priest / assistant</li>
          <li>Live streaming / recorded video (for ONLINE)</li>
          <li>Travel fee (for HOME): first 5 km free</li>
        </ul>
      </div>
    </div>
  );
}
