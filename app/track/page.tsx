"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/navbar";

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending:   { label: "Pending Review", color: "#92400E", bg: "#FEF3C7", desc: "Your report has been received and is waiting to be reviewed by a SpeakEqual staff member." },
  reviewing: { label: "Under Review",   color: "#1E40AF", bg: "#DBEAFE", desc: "A staff member is currently reviewing your report. We may reach out if additional information is needed." },
  resolved:  { label: "Resolved",       color: "#065F46", bg: "#D1FAE5", desc: "Your report has been reviewed and resolved. Contact the SpeakEqual office for details." },
};

interface TrackResult {
  status:             string;
  discriminationType: string;
  submittedAt:        string;
  lastUpdated:        string;
}

function TrackContent() {
  const searchParams = useSearchParams();

  const [code, setCode]         = useState(searchParams.get("code") ?? "");
  const [result, setResult]     = useState<TrackResult | null>(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch(`/api/track?code=${encodeURIComponent(code.trim())}`);
    if (res.ok) {
      setResult(await res.json());
    } else {
      const d = await res.json();
      setError(d.error ?? "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const statusInfo = result ? (STATUS_INFO[result.status] ?? { label: result.status, color: "#374151", bg: "#F3F4F6", desc: "" }) : null;

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* Header */}
        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <span className="section-label" style={{ color: "#fff", display: "block", marginBottom: "0.75rem" }}>Report Tracking</span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", marginBottom: "1rem" }}>
              Check Your Report Status
            </h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.78)", fontSize: "1rem", lineHeight: 1.7 }}>
              Enter your tracking code to see the current status of your report. No account required.
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "540px", margin: "0 auto", padding: "3rem 1.5rem" }}>

          {/* Lookup form */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "1rem" }}>Enter Tracking Code</h2>
            <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "0.4rem" }}>
                  Tracking Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="SE-XXXX"
                  maxLength={7}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "var(--color-bg-muted)", border: "1.5px solid var(--color-border)",
                    borderRadius: "8px", padding: "0.7rem 1rem",
                    fontFamily: "var(--font-body)", fontSize: "1.1rem",
                    fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-primary)",
                    textTransform: "uppercase",
                  }}
                />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.4rem" }}>
                  Your tracking code was shown when you submitted your report and sent in your confirmation email (e.g. SE-A4K2).
                </p>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                  <p style={{ fontFamily: "var(--font-body)", color: "#991B1B", fontSize: "0.875rem", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="btn-primary"
                style={{ opacity: loading || !code.trim() ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
              >
                {loading ? "Looking up…" : "Check Status"}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && statusInfo && (
            <div className="card" style={{ borderTop: `4px solid ${statusInfo.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                    Tracking Code
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.1em", color: "var(--color-text-primary)" }}>{code.toUpperCase()}</p>
                </div>
                <span style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: "0.78rem", fontWeight: 700, padding: "0.3rem 0.85rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {statusInfo.label}
                </span>
              </div>

              <div style={{ background: "var(--color-bg-muted)", borderRadius: "8px", padding: "0.875rem 1rem", marginBottom: "1.25rem" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                  {statusInfo.desc}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Protected Class</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: 500 }}>{result.discriminationType}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Submitted</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                    {new Date(result.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Last Updated</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                    {new Date(result.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Need to file a new report or book an appointment?
            </p>
            <Link href="/report" className="btn-outline" style={{ fontSize: "0.875rem" }}>Go to Report Page</Link>
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
