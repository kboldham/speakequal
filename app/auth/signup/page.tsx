"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/auth/signin?registered=true");
  }

  const eyeIcon = (visible: boolean) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>

      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>D</span>
        </div>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-primary)" }}>
          Speak Equal
        </span>
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "0.25rem" }}>Create an account</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>
          Track your reports and manage appointments. Completely optional.
        </p>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#991B1B" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="First and last name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

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
            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                required
                className="form-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position:   "absolute",
                  right:      "0.75rem",
                  top:        "50%",
                  transform:  "translateY(-50%)",
                  background: "none",
                  border:     "none",
                  cursor:     "pointer",
                  color:      "var(--color-text-muted)",
                  display:    "flex",
                  alignItems: "center",
                  padding:    0,
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {eyeIcon(showPw)}
              </button>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>
              At least 8 characters. Use a mix of letters, numbers, and symbols for a stronger password.
            </p>
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                required
                className="form-input"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{
                  position:   "absolute",
                  right:      "0.75rem",
                  top:        "50%",
                  transform:  "translateY(-50%)",
                  background: "none",
                  border:     "none",
                  cursor:     "pointer",
                  color:      "var(--color-text-muted)",
                  display:    "flex",
                  alignItems: "center",
                  padding:    0,
                }}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {eyeIcon(showConfirm)}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: "1rem", padding: "0.75rem", marginTop: "0.25rem" }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center", marginTop: "1.25rem" }}>
          Already have an account?{" "}
          <Link href="/auth/signin" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
