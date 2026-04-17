import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_LABELS: Record<string, string> = {
  race: "Race", color: "Color", religion: "Religion", sex: "Sex",
  national_origin: "National Origin", age: "Age (40+)", disability: "Disability",
  sexual_orientation: "Sexual Orientation", gender_identity: "Gender Identity",
  familial_status: "Familial Status", veteran_status: "Veteran Status",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  reviewing: { bg: "#DBEAFE", color: "#1E40AF" },
  resolved:  { bg: "#D1FAE5", color: "#065F46" },
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports"      },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/slots",        label: "Time Slots"   },
  { href: "/admin/users",        label: "Users"        },
];

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "admin") redirect("/dashboard");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalReports, pendingReports, totalAppointments, recentReports, recentAppointments, reportsByType, reportsThisWeek] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { status: "scheduled" } }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take:    6,
      include: { user: { select: { email: true } } },
    }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take:    5,
      include: { user: { select: { email: true } }, slot: true },
    }),
    prisma.report.groupBy({
      by:      ["discriminationType"],
      _count:  { _all: true },
      orderBy: { _count: { discriminationType: "desc" } },
    }),
    prisma.report.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <aside style={{ width: "200px", background: "#fff", borderRight: "1px solid #E5E7EB", padding: "1.5rem 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 1rem 1.25rem", borderBottom: "1px solid #E5E7EB", marginBottom: "0.5rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>SpeakEqual</div>
            <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: "0.15rem" }}>Admin Portal</div>
          </div>
          <nav style={{ padding: "0 0.5rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            {NAV.map(({ href, label }) => {
              const active = href === "/admin";
              return (
                <Link key={href} href={href} style={{
                  display: "block", padding: "0.5rem 0.75rem", borderRadius: "6px",
                  color:      active ? "#111827" : "#6B7280",
                  background: active ? "#F3F4F6" : "transparent",
                  textDecoration: "none", fontSize: "0.875rem", fontWeight: active ? 600 : 400,
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #E5E7EB", padding: "0.75rem 0.5rem 1rem" }}>
            <Link href="/" style={{ display: "block", padding: "0.5rem 0.75rem", color: "#6B7280", textDecoration: "none", fontSize: "0.8rem" }}>
              ← Back to site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: "2rem", overflowX: "auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>Admin overview</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Reports",       value: totalReports      },
              { label: "Pending Review",       value: pendingReports    },
              { label: "Active Appointments",  value: totalAppointments },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.25rem 1.5rem" }}>
                <p style={{ color: "#6B7280", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{label}</p>
                <p style={{ fontSize: "2rem", color: "#111827", fontWeight: 700, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recent Reports */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>Recent Reports</h2>
              <Link href="/admin/reports" style={{ color: "#4F46E5", fontSize: "0.825rem", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
            </div>

            {recentReports.length === 0 ? (
              <p style={{ color: "#6B7280", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>No reports yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      {["Resident", "Type", "Date", "Source", "Status"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#6B7280", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map(r => {
                      const sc = STATUS_COLORS[r.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
                      return (
                        <tr key={r.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                          <td style={{ padding: "0.75rem", color: "#374151" }}>{r.user?.email ?? "Anonymous"}</td>
                          <td style={{ padding: "0.75rem", color: "#374151", textTransform: "capitalize" }}>{r.discriminationType.replace(/_/g, " ")}</td>
                          <td style={{ padding: "0.75rem", color: "#6B7280", whiteSpace: "nowrap" }}>{new Date(r.incidentDate).toLocaleDateString()}</td>
                          <td style={{ padding: "0.75rem" }}>
                            <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "0.72rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "4px", textTransform: "uppercase" }}>
                              {r.source}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase" }}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>Upcoming Appointments</h2>
              <Link href="/admin/appointments" style={{ color: "#4F46E5", fontSize: "0.825rem", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentAppointments.filter(a => a.user).map(a => {
                const sc = STATUS_COLORS[a.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#F9FAFB", borderRadius: "6px", border: "1px solid #E5E7EB", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ color: "#374151", fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{a.user!.email}</p>
                      <p style={{ color: "#6B7280", fontSize: "0.78rem", marginTop: "0.15rem" }}>
                        {new Date(a.slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase" }}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
              {recentAppointments.filter(a => a.user).length === 0 && (
                <p style={{ color: "#6B7280", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>No appointments yet.</p>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>Reports by Protected Class</h2>
              <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>{reportsThisWeek} new this week</span>
            </div>

            {reportsByType.length === 0 ? (
              <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>No reports yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {reportsByType.map(r => {
                  const pct = totalReports > 0 ? Math.round((r._count._all / totalReports) * 100) : 0;
                  const label = TYPE_LABELS[r.discriminationType] ?? r.discriminationType;
                  return (
                    <div key={r.discriminationType}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{r._count._all}</span>
                      </div>
                      <div style={{ background: "#F3F4F6", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, background: "#4F46E5", height: "100%", borderRadius: "4px", transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Management */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>User Management</h2>
            <p style={{ color: "#6B7280", fontSize: "0.825rem", marginBottom: "1rem" }}>Manage user accounts, roles, and password resets.</p>
            <Link href="/admin/users" style={{ display: "inline-block", background: "#4F46E5", color: "#fff", borderRadius: "6px", padding: "0.45rem 1rem", fontSize: "0.825rem", textDecoration: "none", fontWeight: 600 }}>
              Manage Users
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
