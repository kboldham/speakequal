"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Slot {
  startTime: string;
  endTime:   string;
}

interface Appointment {
  id:        string;
  status:    string;
  source:    string;
  reason:    string | null;
  createdAt: string;
  slot:      Slot;
  user:      { name: string | null; email: string } | null;
}

const STATUS_OPTIONS = ["scheduled", "completed", "cancelled"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports"      },
  { href: "/admin/appointments", label: "Appointments", active: true },
  { href: "/admin/slots",        label: "Time Slots"   },
  { href: "/admin/users",        label: "Users"        },
];

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
    if (status === "authenticated") fetchAppointments();
  }, [status]);

  async function fetchAppointments() {
    const res = await fetch("/api/admin?view=appointments");
    if (res.ok) setAppointments(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    await fetch("/api/admin", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ type: "appointment", id, status: newStatus }),
    });
    await fetchAppointments();
    setUpdatingId(null);
  }

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Appointments</h1>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</p>
          </div>

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
            <p style={{ color: "#6B7280" }}>No appointments found.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
                  {["Resident", "Date & Time", "Source", "Reason", "Status", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#6B7280", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const sc = STATUS_STYLES[a.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <p style={{ color: "#111827", fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{a.user?.email ?? "Anonymous"}</p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>
                        {new Date(a.slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.45rem", borderRadius: "4px", textTransform: "uppercase" }}>
                          {a.source}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#6B7280", fontSize: "0.825rem", maxWidth: "200px" }}>
                        {a.reason ?? <span style={{ color: "#D1D5DB" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase" }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <select
                          value={a.status}
                          disabled={updatingId === a.id}
                          onChange={e => updateStatus(a.id, e.target.value)}
                          style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
