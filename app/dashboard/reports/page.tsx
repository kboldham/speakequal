import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "../../components/navbar";
import ReportNotes from "../../components/ReportNotes";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  reviewing: { bg: "#DBEAFE", color: "#1E40AF" },
  resolved:  { bg: "#D1FAE5", color: "#065F46" },
};

const TYPE_LABELS: Record<string, string> = {
  race:               "Race",
  color:              "Color",
  religion:           "Religion",
  sex:                "Sex",
  national_origin:    "National Origin",
  age:                "Age (40+)",
  disability:         "Disability",
  sexual_orientation: "Sexual Orientation",
  gender_identity:    "Gender Identity or Expression",
  familial_status:    "Familial Status",
  veteran_status:     "Veteran Status",
};

export default async function UserReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  if (session.user.role === "admin") redirect("/admin");

  const reports = await prisma.report.findMany({
    where:   { userId: session.user.id },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* Header */}
        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "3.5rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff" }}>My Reports</h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {reports.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>No reports yet</h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                When you file a report it will appear here with its status.
              </p>
              <Link href="/report" className="btn-primary">File a Report</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reports.map(r => {
                const sc = STATUS_STYLES[r.status] ?? { bg: "#F3F4F6", color: "#374151" };
                return (
                  <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                          {TYPE_LABELS[r.discriminationType] ?? r.discriminationType}
                        </h3>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          Incident: {new Date(r.incidentDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                          {" · "}Submitted: {new Date(r.createdAt).toLocaleDateString()}
                          {" · "}via {r.source}
                        </p>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {r.status}
                      </span>
                    </div>

                    {/* Status explanation */}
                    <div style={{ background: "var(--color-bg-muted)", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                        {r.status === "pending"   && "Your report has been received and is waiting to be reviewed by the SpeakEqual ."}
                        {r.status === "reviewing" && "A staff member at the SpeakEqual is currently reviewing your report."}
                        {r.status === "resolved"  && "Your report has been reviewed and resolved. Contact the SpeakEqual for details."}
                      </p>
                    </div>

                    {/* Notes */}
                    <ReportNotes reportId={r.id} />

                    {/* Attachments */}
                    {r.attachments.length > 0 && (
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                          Attachments
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {r.attachments.map(a => (
                            <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                              background:     "var(--color-primary-light)",
                              color:          "var(--color-primary)",
                              fontSize:       "0.78rem",
                              fontWeight:     600,
                              padding:        "0.25rem 0.65rem",
                              borderRadius:   "999px",
                              textDecoration: "none",
                              fontFamily:     "var(--font-body)",
                            }}>
                              📎 {a.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/report" className="btn-primary">File Another Report</Link>
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}