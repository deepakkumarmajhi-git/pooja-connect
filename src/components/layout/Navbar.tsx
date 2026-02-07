"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as "CUSTOMER" | "PRIEST" | "ADMIN" | undefined;

  const dashboardHref =
    role === "ADMIN"
      ? "/admin"
      : role === "PRIEST"
      ? "/dashboard/priest"
      : "/dashboard/customer";

  return (
    <div
      style={{
        borderBottom: "1px solid #e5e5e5",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 900, textDecoration: "none", color: "black" }}>
          PujaPlatform
        </Link>
        <Link href="/pujas" style={{ textDecoration: "none", color: "black" }}>
          Pujas
        </Link>
        <Link href="/priests" style={{ textDecoration: "none", color: "black" }}>
          Priests
        </Link>
        {role ? (
          <Link href={dashboardHref} style={{ textDecoration: "none", color: "black" }}>
            Dashboard
          </Link>
        ) : null}
        <Link href="/settings" style={{ textDecoration: "none", color: "black" }}>
          Settings
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {role ? (
          <>
            <span style={{ fontSize: 13, color: "#444" }}>
              {data?.user?.email} ({role})
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                border: "1px solid #e5e5e5",
                padding: "8px 12px",
                borderRadius: 10,
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e5e5",
              padding: "8px 12px",
              borderRadius: 10,
              color: "black",
              fontWeight: 700,
            }}
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
