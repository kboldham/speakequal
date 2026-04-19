"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Attachment {
  id:       string;
  fileName: string;
  fileUrl:  string;
}

interface Report {
  id:                 string;
  status:             string;
  source:             string;
  discriminationType: string;
  category:           string | null;
  description:        string;
  incidentDate:       string;
  createdAt:          string;
  attachments:        Attachment[];
  user:               { name: string | null; email: string } | null;
  firstName:          string | null;
  lastName:           string | null;
  phone:              string | null;
  address:            string | null;
  zipCode:            string | null;
  respondentName:     string | null;
  respondentAddress:  string | null;
  respondentPhone:    string | null;
}

const STATUS_OPTIONS = ["pending", "reviewing", "resolved"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  reviewing: { bg: "#DBEAFE", color: "#1E40AF" },
  resolved:  { bg: "#D1FAE5", color: "#065F46" },
};

const TYPE_LABELS: Record<string, string> = {
  race: "Race", color: "Color", religion: "Religion", sex: "Sex",
  national_origin: "National Origin", age: "Age (40+)", disability: "Disability",
  sexual_orientation: "Sexual Orientation", gender_identity: "Gender Identity",
  familial_status: "Familial Status", veteran_status: "Veteran Status",
};

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports",      active: true  },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/slots",        label: "Availability" },
  { href: "/admin/users",        label: "Users"        },
];

function AdminReportsContent() {
  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports]       = useState<Report[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState(searchParams.get("status") ?? "all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
    if (status === "authenticated") fetchReports();
  }, [status]);

  async function fetchReports() {
    const res = await fetch("/api/admin?view=reports");
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    await fetch("/api/admin", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ type: "report", id, status: newStatus }),
    });
    await fetchReports();
    setUpdatingId(null);
  }

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Loading…</p>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: "200px", background: "#fff", borderRight: "1px solid #E5E7EB", padding: "1.5rem 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 1rem 1.25rem", borderBottom: "1px solid #E5E7EB", marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>SpeakEqual</div>
          <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: "0.15rem" }}>Admin Portal</div>
        </div>
        <nav style={{ padding: "0 0.5rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          {NAV.map(({ href, label, active }) => (
            <Link key={href} href={href} style={{
              display: "block", padding: "0.5rem 0.75rem", borderRadius: "6px",
              color:      active ? "#111827" : "#6B7280",
              background: active ? "#F3F4F6" : "transparent",
              textDecoration: "none", fontSize: "0.875rem", fontWeight: active ? 600 : 400,
            }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #E5E7EB", padding: "0.75rem 0.5rem 1rem" }}>
          <Link href="/" style={{ display: "block", padding: "0.5rem 0.75rem", color: "#6B7280", textDecoration: "none", fontSize: "0.8rem" }}>
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, padding: "2rem", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Reports</h1>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {filtered.length} report{filtered.length !== 1 ? "s" : ""}{filter !== "all" ? ` · ${filter}` : ""}
            </p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "0.25rem", background: "#F3F4F6", padding: "0.25rem", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
            {["all", ...STATUS_OPTIONS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "0.35rem 0.75rem", borderRadius: "6px", border: "none", cursor: "pointer",
                background:   filter === f ? "#fff" : "transparent",
                color:        filter === f ? "#111827" : "#6B7280",
                fontSize: "0.825rem", fontWeight: filter === f ? 600 : 400,
                textTransform: "capitalize", boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4rem", textAlign: "center" }}>
            <p style={{ color: "#6B7280" }}>No reports found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map(r => {
              const sc        = STATUS_STYLES[r.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
              const isExpanded = expandedId === r.id;

              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>

                  {/* Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                        <p style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem", margin: 0 }}>
                          {r.user?.email ?? "Anonymous"}
                        </p>
                        <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "0.7rem", fontWeight: 600, padding: "0.1rem 0.45rem", borderRadius: "4px", textTransform: "uppercase" }}>
                          {r.source}
                        </span>
                      </div>
                      <p style={{ color: "#6B7280", fontSize: "0.78rem", margin: 0 }}>
                        {TYPE_LABELS[r.discriminationType] ?? r.discriminationType} · {new Date(r.incidentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        style={{
                          background: sc.bg, color: sc.color,
                          border: "1px solid transparent", borderRadius: "4px",
                          padding: "0.25rem 0.5rem", fontSize: "0.72rem", fontWeight: 700,
                          textTransform: "uppercase", cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} style={{ background: "#fff", color: "#111827", textTransform: "capitalize" }}>{s}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "0.3rem 0.65rem", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: "1.25rem", borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}>

                      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        {r.category && (
                          <div>
                            <p style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>Category</p>
                            <p style={{ color: "#374151", fontSize: "0.825rem", textTransform: "capitalize" }}>{r.category.replace(/_/g, " ")}</p>
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>Protected Class</p>
                          <p style={{ color: "#374151", fontSize: "0.825rem" }}>{TYPE_LABELS[r.discriminationType] ?? r.discriminationType}</p>
                        </div>
                      </div>

                      {(r.firstName || r.phone || r.address) && (
                        <div style={{ marginBottom: "1rem" }}>
                          <p style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>Complainant Contact</p>
                          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                            {(r.firstName || r.lastName) && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{[r.firstName, r.lastName].filter(Boolean).join(" ")}</p>}
                            {r.phone   && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{r.phone}</p>}
                            {r.address && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{r.address}{r.zipCode ? `, ${r.zipCode}` : ""}</p>}
                          </div>
                        </div>
                      )}

                      {(r.respondentName || r.respondentAddress || r.respondentPhone) && (
                        <div style={{ marginBottom: "1rem" }}>
                          <p style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>Respondent</p>
                          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                            {r.respondentName    && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{r.respondentName}</p>}
                            {r.respondentPhone   && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{r.respondentPhone}</p>}
                            {r.respondentAddress && <p style={{ color: "#374151", fontSize: "0.825rem" }}>{r.respondentAddress}</p>}
                          </div>
                        </div>
                      )}

                      <p style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Description</p>
                      <p style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>{r.description}</p>

                      {r.attachments.length > 0 && (
                        <div>
                          <p style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Attachments</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {r.attachments.map(a => (
                              <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#4F46E5", fontSize: "0.78rem", padding: "0.25rem 0.65rem", borderRadius: "4px", textDecoration: "none", border: "1px solid #E5E7EB" }}>
                                {a.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "1rem" }}>
                        Submitted {new Date(r.createdAt).toLocaleString()} · Report ID: {r.id}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense>
      <AdminReportsContent />
    </Suspense>
  );
}
