import Link from "next/link";

export default function AdminHome() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Admin Dashboard</h1>
      <p style={{ marginTop: 6, color: "#666" }}>
        Approve priests, manage catalog, monitor bookings and payouts.
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/admin/priests" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Priest Approvals
          </div>
        </Link>

        <Link href="/admin/catalog" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Puja Catalog
          </div>
        </Link>

        <Link href="/admin/bookings" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Bookings
          </div>
        </Link>

        <Link href="/admin/payouts" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Payments & Payouts
          </div>
        </Link>
      </div>
    </div>
  );
}
