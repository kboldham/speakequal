"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/navbar";

interface Appointment {
  id:          string;
  status:      string;
  source:      string;
  startTime:   string;
  zoomJoinUrl: string | null;
  createdAt:   string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function UserAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated") fetchData();
  }, [status]);

  async function fetchData() {
    const res = await fetch("/api/appointments");
    if (res.ok) setAppointments(await res.json());
    setLoading(false);
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Loading...</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "3.5rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
              Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff" }}>My Appointments</h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {appointments.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>No appointments yet</h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                Schedule a confidential Zoom consultation with a SpeakEqual advocate.
              </p>
              <Link href="/report" className="btn-primary">Schedule an Appointment</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {appointments.map(a => {
                const sc = STATUS_STYLES[a.status] ?? { bg: "#F3F4F6", color: "#374151" };
                const isFuture = new Date(a.startTime) > new Date();

                return (
                  <div key={a.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                          {new Date(a.startTime).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                        </h3>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          30 min · Zoom call · via {a.source}
                        </p>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {a.status}
                      </span>
                    </div>

                    {a.zoomJoinUrl && a.status === "scheduled" && isFuture && (
                      <a
                        href={a.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-block", background: "#2D8CFF", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none" }}
                      >
                        Join Zoom Call
                      </a>
                    )}

                    {a.status === "scheduled" && !isFuture && (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-muted)" }}>
                        This appointment has passed. To reschedule, please book a new time.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/report" className="btn-primary">Schedule Another Appointment</Link>
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}
