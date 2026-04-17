import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "../components/navbar";

const STATUS_STYLES: Record<string, string> = {
  pending:   "status-pending",
  reviewing: "status-reviewing",
  resolved:  "status-resolved",
};

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  if (session.user.role === "admin") redirect("/admin");

  const [reports, appointments] = await Promise.all([
    prisma.report.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    prisma.appointment.findMany({
      where:   { userId: session.user.id },
      include: { slot: true },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "3rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.4rem" }}>My Portal</span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff" }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              SpeakEqual — Resident Portal
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* ── ACTION CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>

            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "0.4rem" }}>File a Report</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Report a discrimination incident using the AI assistant or manual form.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <Link href="/report?tab=report&mode=ai" className="btn-primary" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>AI Assistant</Link>
                <Link href="/report?tab=report&mode=form" className="btn-outline" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>Manual Form</Link>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "0.4rem" }}>Schedule Appointment</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Book a confidential in-person consultation with a SpeakEqual advocate.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <Link href="/report?tab=appointment&mode=ai" className="btn-primary" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>AI Assistant</Link>
                <Link href="/report?tab=appointment&mode=calendar" className="btn-outline" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>Calendar</Link>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "0.4rem" }}>Know Your Rights</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Read about Durham's 11 protected classes and applicable laws.
              </p>
              <Link href="/learnmore" className="btn-outline" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>Read more</Link>
            </div>

            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "0.4rem" }}>My Profile</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Change your email or password, or delete your account.
              </p>
              <Link href="/dashboard/profile" className="btn-outline" style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}>Manage Profile</Link>
            </div>
          </div>

          {/* ── MY REPORTS ── */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>My Reports</h2>
              <Link href="/dashboard/reports" style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>

            {reports.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "2rem 0" }}>
                No reports filed yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {reports.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "var(--color-bg-muted)", borderRadius: "10px", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>
                        {r.discriminationType.replace(/_/g, " ")}
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                        {new Date(r.incidentDate).toLocaleDateString()} · via {r.source}
                      </p>
                    </div>
                    <span className={`status-badge ${STATUS_STYLES[r.status] ?? ""}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── MY APPOINTMENTS ── */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>My Appointments</h2>
              <Link href="/dashboard/appointments" style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>

            {appointments.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "2rem 0" }}>
                No appointments scheduled.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {appointments.map(a => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "var(--color-bg-muted)", borderRadius: "10px", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>
                        {new Date(a.slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                        30 min · via {a.source}
                      </p>
                    </div>
                    <span className={`status-badge ${STATUS_STYLES[a.status] ?? ""}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}