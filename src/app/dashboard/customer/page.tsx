import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Customer Dashboard</h1>
      <p style={{ marginTop: 6, color: "#666" }}>
        View upcoming pujas, booking history, and update your profile.
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/dashboard/customer/upcoming" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Upcoming Pujas
          </div>
        </Link>

        <Link href="/dashboard/customer/profile" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Profile
          </div>
        </Link>

        <Link href="/pujas" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Browse Pujas
          </div>
        </Link>
      </div>
    </div>
  );
}
