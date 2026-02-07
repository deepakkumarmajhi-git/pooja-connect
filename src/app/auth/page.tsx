"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Mode = "login" | "register";
type Role = "CUSTOMER" | "PRIEST";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  // Common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");

  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Registration failed");
        return;
      }

      setMessage("Registered successfully. Now login.");
      setMode("login");
    } catch (err: any) {
      setMessage(err?.message || "Registration error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setMessage("Invalid email or password");
        return;
      }

      // After successful login, go to redirect handler route
      window.location.href = "/auth/redirect";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e5e5", borderRadius: 14, padding: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e5e5e5",
              background: mode === "login" ? "#000" : "#fff",
              color: mode === "login" ? "#fff" : "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e5e5e5",
              background: mode === "register" ? "#000" : "#fff",
              color: mode === "register" ? "#fff" : "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>

        {message ? (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#f6f6f6" }}>
            {message}
          </div>
        ) : null}

        {mode === "register" ? (
          <form onSubmit={handleRegister} style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
            </label>

            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Role</div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="PRIEST">Priest (Pandit)</option>
              </select>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Priests need admin approval before appearing publicly.
              </div>
            </label>

            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
            </label>

            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
            </label>

            <button
              disabled={loading}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#000",
                color: "#fff",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
            </label>

            <label>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
            </label>

            <button
              disabled={loading}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#000",
                color: "#fff",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
