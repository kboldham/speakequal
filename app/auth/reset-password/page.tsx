"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm]       = useState({ password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("This reset link is invalid. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password: form.password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>Invalid link</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          This reset link is invalid or has already been used. Please request a new one.
        </p>
        <Link href="/auth/forgot-password" className="btn-primary" style={{ display: "block", textAlign: "center" }}>
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>Password updated</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <Link href="/auth/signin" className="btn-primary" style={{ display: "block", textAlign: "center" }}>
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "0.25rem" }}>Set new password</h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>
        Choose a new password for your account.
      </p>

      {error && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#991B1B" }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>New Password</label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Confirm Password</label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="Repeat your new password"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: "1rem", padding: "0.75rem", marginTop: "0.25rem" }}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={
        <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>Loading...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
