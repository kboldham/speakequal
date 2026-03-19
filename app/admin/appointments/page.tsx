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
  user:      { name: string | null; email: string };
}

const STATUS_OPTIONS = ["scheduled", "completed", "cancelled"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

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
            { href: "/admin",              icon: "", label: "Dashboard"       },
            { href: "/admin/reports",      icon: "", label: "Reports"        },
            { href: "/admin/appointments", icon: "", label: "Appointments", active: true },
            { href: "/admin/slots",        icon: "", label: "Time Slots"     },
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
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "#F1F5F9" }}>Appointments</h1>
            <p style={{ color: "#64748B", fontSize: "0.85rem" }}>{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</p>
          </div>

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

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "4rem", textAlign: "center" }}>
            <p style={{ color: "#64748B", fontFamily: "var(--font-body)" }}>No appointments found.</p>
          </div>
        ) : (
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Resident", "Date & Time", "Source", "Reason", "Status", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#64748B", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const sc = STATUS_STYLES[a.status] ?? { bg: "#334155", color: "#94A3B8" };
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid #1E293B" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <p style={{ color: "#CBD5E1", fontWeight: 600, fontSize: "0.875rem" }}>{a.user.name ?? "Anonymous"}</p>
                        <p style={{ color: "#64748B", fontSize: "0.75rem" }}>{a.user.email}</p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#CBD5E1", whiteSpace: "nowrap" }}>
                        {new Date(a.slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: a.source === "ai" ? "#1E3A5F" : "#1A3A2A", color: a.source === "ai" ? "#60A5FA" : "#34D399", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                          {a.source}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#64748B", fontSize: "0.825rem", maxWidth: "200px" }}>
                        {a.reason ?? <span style={{ color: "#334155" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", textTransform: "uppercase" }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <select
                          value={a.status}
                          disabled={updatingId === a.id}
                          onChange={e => updateStatus(a.id, e.target.value)}
                          style={{ background: "#334155", color: "#F1F5F9", border: "none", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-body)" }}
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