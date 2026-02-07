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
  const items = await getCatalog();

  // Group by category (nice UX)
  const grouped = items.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Puja Catalog</h1>
      <p style={{ marginTop: 8, color: "#666" }}>
        Browse fixed pujas. Prices may vary by priest; “Starting from” is a guide.
      </p>

      <div style={{ marginTop: 24, display: "grid", gap: 24 }}>
        {Object.keys(grouped).map((cat) => (
          <section key={cat}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {cat}
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {grouped[cat].map((p) => (
                <a
                  key={p._id}
                  href={`/pujas/${p.slug}`}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    padding: 14,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ fontWeight: 700 }}>From ₹{p.startingFrom}</div>
                  </div>

                  <div style={{ marginTop: 6, color: "#666" }}>{p.description}</div>

                  <div style={{ marginTop: 10, fontSize: 13, color: "#444" }}>
                    ⏱ {p.defaultDurationMins} mins • Modes: {p.modesSupported.join(", ")} • Typical: ₹{p.typicalMin}–₹{p.typicalMax}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
