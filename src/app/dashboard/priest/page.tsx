"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PriestDashboard() {
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch("/api/priest/me")
      .then((r) => r.json())
      .then((d) => setStatus(d?.profile?.approvalStatus || "PENDING"))
      .catch(() => setStatus("PENDING"));
  }, []);

  const isApproved = status === "APPROVED";

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Priest Dashboard</h1>

      {!isApproved ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#fff7e6", border: "1px solid #ffe1a6" }}>
          <b>Approval pending:</b> Your profile is under admin verification. Once approved, customers can see you and you can accept bookings.
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#eefaf0", border: "1px solid #c8f0d0" }}>
          ✅ You are approved and visible to customers.
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/dashboard/priest/bookings" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Bookings
          </div>
        </Link>

        <Link href="/dashboard/priest/services" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Services
          </div>
        </Link>

        <Link href="/dashboard/priest/profile" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Profile
          </div>
        </Link>

        <Link href="/dashboard/priest/media" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Media
          </div>
        </Link>

        <Link href="/dashboard/priest/requests" style={{ textDecoration: "none" }}>
          <div style={{ border: "1px solid #e5e5e5", padding: 14, borderRadius: 12, fontWeight: 800, color: "black" }}>
            Requests
          </div>
        </Link>

      </div>
    </div>
  );
}
