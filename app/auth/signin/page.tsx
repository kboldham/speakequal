"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email:    form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      // middleware handles role-based redirect
      router.push("/dashboard");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>D</span>
        </div>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-primary)" }}>
          SpeakEqual
        </span>
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "0.25rem" }}>Sign in</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>
          Access your reports and appointments.
        </p>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#991B1B" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Email</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600 }}>Password</label>
              <Link href="/auth/forgot-password" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: "1rem", padding: "0.75rem", marginTop: "0.25rem" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center", marginTop: "1.25rem" }}>
          Don't have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
          No account needed to{" "}
          <Link href="/report" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            file a report anonymously
          </Link>
        </p>
      </div>
    </main>
  );
}