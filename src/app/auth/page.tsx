"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "register";
type Role = "CUSTOMER" | "PRIEST";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Registration error");
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
      window.location.href = "/auth/redirect";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm border-[var(--border)] shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            {mode === "login" ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription className="text-sm">
            {mode === "login"
              ? "Sign in with your email and password."
              : "Register as a customer or priest (priests need admin approval)."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                mode === "login"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              aria-pressed={mode === "login"}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                mode === "register"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              aria-pressed={mode === "register"}
            >
              Register
            </button>
          </div>

          {message ? (
            <div
              className="mt-4 rounded-lg border border-[var(--border)] bg-slate-50 p-3 text-sm text-[var(--foreground)] dark:bg-slate-800"
              role="alert"
            >
              {message}
            </div>
          ) : null}

          {mode === "register" ? (
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Name</span>
                <Input
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label="Role"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PRIEST">Priest (Pandit)</option>
                </select>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Priests need admin approval before appearing publicly.
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <Input
                  type="email"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <Input
                  type="password"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <Input
                  type="email"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <Input
                  type="password"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
