"use client";

import { useEffect, useState } from "react";
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
  description:        string;
  incidentDate:       string;
  createdAt:          string;
  attachments:        Attachment[];
  user:               { name: string | null; email: string };
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

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports]         = useState<Report[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState(searchParams.get("status") ?? "all");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

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
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#64748B", fontFamily: "var(--font-body)" }}>Loading…</p>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0F172A", display: "flex" }}>

      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#0A1628", borderRight: "1px solid #1E293B", padding: "1.5rem 0", flexShrink: 0 }}>
        <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid #1E293B" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#F1F5F9", fontWeight: 700 }}>Durham HRC</div>
          <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "0.2rem" }}>Admin Portal</div>
        </div>
        <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {[
            { href: "/admin",              icon: "", label: "Dashboard"     },
            { href: "/admin/reports",      icon: "", label: "Reports",  active: true },
            { href: "/admin/appointments", icon: "", label: "Appointments" },
            { href: "/admin/slots",        icon: "", label: "Time Slots"   },
          ].map(({ href, icon, label, active }) => (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.55rem 0.75rem", borderRadius: "8px",
              color:      active ? "#F1F5F9" : "#94A3B8",
              background: active ? "#1E293B" : "transparent",
              textDecoration: "none", fontSize: "0.875rem",
            }}>
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, padding: "2rem", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "#F1F5F9" }}>Reports</h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem" }}>{filtered.length} report{filtered.length !== 1 ? "s" : ""} {filter !== "all" ? `· ${filter}` : ""}</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "0.4rem", background: "#1E293B", padding: "0.3rem", borderRadius: "10px" }}>
            {["all", ...STATUS_OPTIONS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "0.4rem 0.875rem", borderRadius: "7px", border: "none", cursor: "pointer",
                background:   filter === f ? "#0F172A" : "transparent",
                color:        filter === f ? "#F1F5F9" : "#64748B",
                fontFamily:   "var(--font-body)", fontSize: "0.825rem", fontWeight: 600,
                textTransform: "capitalize",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "4rem", textAlign: "center" }}>
            <p style={{ color: "#64748B", fontFamily: "var(--font-body)" }}>No reports found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map(r => {
              const sc        = STATUS_STYLES[r.status] ?? { bg: "#334155", color: "#94A3B8" };
              const isExpanded = expandedId === r.id;

              return (
                <div key={r.id} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", overflow: "hidden" }}>

                  {/* Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "#CBD5E1", fontSize: "0.9rem" }}>
                          {r.user.name ?? r.user.email}
                        </p>
                        <span style={{ background: r.source === "ai" ? "#1E3A5F" : "#1A3A2A", color: r.source === "ai" ? "#60A5FA" : "#34D399", fontSize: "0.7rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "999px" }}>
                          {r.source}
                        </span>
                      </div>
                      <p style={{ color: "#64748B", fontSize: "0.78rem" }}>
                        {TYPE_LABELS[r.discriminationType] ?? r.discriminationType} · {new Date(r.incidentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      {/* Status dropdown */}
                      <select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        style={{
                          background: sc.bg, color: sc.color,
                          border: "none", borderRadius: "999px",
                          padding: "0.25rem 0.65rem", fontSize: "0.72rem", fontWeight: 700,
                          textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--font-body)",
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} style={{ background: "#1E293B", color: "#F1F5F9", textTransform: "capitalize" }}>{s}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        style={{ background: "#334155", color: "#94A3B8", border: "none", borderRadius: "6px", padding: "0.3rem 0.65rem", cursor: "pointer", fontSize: "0.8rem", fontFamily: "var(--font-body)" }}
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: "1.25rem", borderTop: "1px solid #334155", background: "#0F172A" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Description</p>
                      <p style={{ fontFamily: "var(--font-body)", color: "#CBD5E1", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                        {r.description}
                      </p>

                      {r.attachments.length > 0 && (
                        <div>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Attachments</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {r.attachments.map(a => (
                              <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ background: "#1E293B", color: "#60A5FA", fontSize: "0.78rem", padding: "0.25rem 0.65rem", borderRadius: "999px", textDecoration: "none", fontFamily: "var(--font-body)", border: "1px solid #334155" }}>
                                📎 {a.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#475569", marginTop: "1rem" }}>
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