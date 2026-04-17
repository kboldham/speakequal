"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    // Always show confirmation regardless of response to prevent enumeration
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>

      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>S</span>
        </div>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-primary)" }}>
          SpeakEqual
        </span>
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        {submitted ? (
          <>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>Check your email</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              If an account with that email address exists, a password reset link has been sent. The link will expire in 1 hour.
            </p>
            <Link href="/auth/signin" className="btn-primary" style={{ display: "block", textAlign: "center" }}>
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "0.25rem" }}>Forgot password?</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>
              Enter your email and we will send you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: "1rem", padding: "0.75rem", marginTop: "0.25rem" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", textAlign: "center", marginTop: "1.25rem" }}>
              <Link href="/auth/signin" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
