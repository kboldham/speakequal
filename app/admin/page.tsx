import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  reviewing: { bg: "#DBEAFE", color: "#1E40AF" },
  resolved:  { bg: "#D1FAE5", color: "#065F46" },
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [totalReports, pendingReports, totalAppointments, recentReports, recentAppointments] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { status: "scheduled" } }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take:    6,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take:    5,
      include: { user: { select: { name: true, email: true } }, slot: true },
    }),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "var(--font-body)" }}>

      {/* ── SIDEBAR + CONTENT LAYOUT ── */}
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <aside style={{ width: "220px", background: "#0A1628", borderRight: "1px solid #1E293B", padding: "1.5rem 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid #1E293B" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#F1F5F9", fontWeight: 700 }}>SpeakEqual</div>
            <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "0.2rem" }}>Admin Portal</div>
          </div>
          <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { href: "/admin",              icon: "", label: "Dashboard"    },
              { href: "/admin/reports",      icon: "", label: "Reports"     },
              { href: "/admin/appointments", icon: "", label: "Appointments"},
              { href: "/admin/slots",        icon: "", label: "Time Slots"  },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href} style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "0.6rem",
                padding:      "0.55rem 0.75rem",
                borderRadius: "8px",
                color:        "#94A3B8",
                textDecoration: "none",
                fontSize:     "0.875rem",
                transition:   "all 0.15s",
              }}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: "auto", padding: "0 0.75rem 1rem" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 0.75rem", color: "#64748B", textDecoration: "none", fontSize: "0.8rem" }}>
              ← Public site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: "2rem", overflowX: "auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "#F1F5F9" }}>Dashboard</h1>
              <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: "0.2rem" }}>Speak Equal  — Admin View</p>
            </div>
            <span style={{ background: "#1E40AF", color: "#93C5FD", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Admin
            </span>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Reports",       value: totalReports,      color: "#60A5FA" },
              { label: "Pending Review",       value: pendingReports,    color: "#FBBF24" },
              { label: "Active Appointments",  value: totalAppointments, color: "#34D399" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "1.25rem 1.5rem" }}>
                <p style={{ color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", color, fontWeight: 700 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recent Reports */}
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", color: "#F1F5F9", fontSize: "1.1rem" }}>Recent Reports</h2>
              <Link href="/admin/reports" style={{ color: "#60A5FA", fontSize: "0.825rem", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    {["Resident", "Type", "Date", "Source", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748B", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map(r => {
                    const sc = STATUS_COLORS[r.status] ?? { bg: "#334155", color: "#94A3B8" };
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #1E293B" }}>
                        <td style={{ padding: "0.75rem", color: "#CBD5E1" }}>{r.user.name ?? r.user.email}</td>
                        <td style={{ padding: "0.75rem", color: "#CBD5E1", textTransform: "capitalize" }}>{r.discriminationType.replace(/_/g, " ")}</td>
                        <td style={{ padding: "0.75rem", color: "#64748B", whiteSpace: "nowrap" }}>{new Date(r.incidentDate).toLocaleDateString()}</td>
                        <td style={{ padding: "0.75rem" }}>
                          <span style={{ background: r.source === "ai" ? "#1E3A5F" : "#1A3A2A", color: r.source === "ai" ? "#60A5FA" : "#34D399", fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                            {r.source}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", textTransform: "uppercase" }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", color: "#F1F5F9", fontSize: "1.1rem" }}>Upcoming Appointments</h2>
              <Link href="/admin/appointments" style={{ color: "#60A5FA", fontSize: "0.825rem", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAppointments.map(a => {
                const sc = STATUS_COLORS[a.status] ?? { bg: "#334155", color: "#94A3B8" };
                
                if (!a.user) return null;
                
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "#0F172A", borderRadius: "10px", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ color: "#CBD5E1", fontWeight: 600, fontSize: "0.875rem" }}>{a.user.name ?? a.user.email}</p>
                      <p style={{ color: "#64748B", fontSize: "0.78rem" }}>
                        {new Date(a.slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })} · via {a.source}
                      </p>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", textTransform: "uppercase" }}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
              {recentAppointments.length === 0 && (
                <p style={{ color: "#64748B", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>No appointments yet.</p>
              )}
            </div>
          </div>

          
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "1.5rem", marginTop: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", color: "#F1F5F9", fontSize: "1.1rem", marginBottom: "1rem" }}>Admin Management</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Password Reset", "User Managment", "Coming Soon"].map(c => (
                <span key={c} style={{ background: "#0F172A", color: "#94A3B8", fontSize: "0.78rem", padding: "0.3rem 0.75rem", borderRadius: "999px", border: "1px solid #334155" }}>{c}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}