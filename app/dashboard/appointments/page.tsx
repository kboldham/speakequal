"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/navbar";

interface Slot {
  id:        string;
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
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function UserAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots]   = useState<Slot[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [rescheduleId, setRescheduleId]       = useState<string | null>(null);
  const [newSlotId, setNewSlotId]             = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated") fetchData();
  }, [status]);

  async function fetchData() {
    const [apptRes, slotRes] = await Promise.all([
      fetch("/api/appointments/user"),
      fetch("/api/appointments"),
    ]);
    if (apptRes.ok) setAppointments(await apptRes.json());
    if (slotRes.ok) setAvailableSlots(await slotRes.json());
    setLoading(false);
  }

  async function handleCancel(appointmentId: string) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setActionLoading(true);
    await fetch("/api/appointments", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ appointmentId, action: "cancel" }),
    });
    await fetchData();
    setActionLoading(false);
  }

  async function handleReschedule(appointmentId: string) {
    if (!newSlotId) return;
    setActionLoading(true);
    await fetch("/api/appointments", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ appointmentId, action: "reschedule", newSlotId }),
    });
    setRescheduleId(null);
    setNewSlotId(null);
    await fetchData();
    setActionLoading(false);
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    </>
  );

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
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff" }}>My Appointments</h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {appointments.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}></div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>No appointments yet</h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                Book a confidential in-person consultation with a SpeakEqual advocate.
              </p>
              <Link href="/report#appointments" className="btn-primary">Schedule an Appointment</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {appointments.map(a => {
                const sc = STATUS_STYLES[a.status] ?? { bg: "#F3F4F6", color: "#374151" };
                const isRescheduling = rescheduleId === a.id;
                const isPast = new Date(a.slot.startTime) < new Date();

                return (
                  <div key={a.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                          {formatSlot(a.slot.startTime)}
                        </h3>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          30 min · in-person · via {a.source}
                          {a.reason && ` · "${a.reason}"`}
                        </p>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {a.status}
                      </span>
                    </div>

                    {/* Location */}
                    <div style={{ background: "var(--color-bg-muted)", borderRadius: "8px", padding: "0.6rem 0.875rem", marginBottom: "0.75rem" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                        📍 101 City Hall Plaza, Durham, NC 27701 · (919) 560-4197
                      </p>
                    </div>

                    {/* Actions — only show for scheduled future appointments */}
                    {a.status === "scheduled" && !isPast && (
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setRescheduleId(isRescheduling ? null : a.id)}
                          className="btn-outline"
                          style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem" }}
                        >
                          {isRescheduling ? "Cancel Reschedule" : "Reschedule"}
                        </button>
                        <button
                          onClick={() => handleCancel(a.id)}
                          disabled={actionLoading}
                          style={{ fontSize: "0.825rem", padding: "0.4rem 0.9rem", background: "none", border: "1.5px solid #FCA5A5", color: "#DC2626", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}

                    {/* Reschedule slot picker */}
                    {isRescheduling && (
                      <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--color-primary-light)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                          Select a new time:
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          {availableSlots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setNewSlotId(newSlotId === slot.id ? null : slot.id)}
                              style={{
                                padding:      "0.6rem 0.75rem",
                                borderRadius: "8px",
                                border:       `2px solid ${newSlotId === slot.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                background:   newSlotId === slot.id ? "var(--color-primary)" : "#fff",
                                color:        newSlotId === slot.id ? "#fff" : "var(--color-text-primary)",
                                cursor:       "pointer",
                                fontFamily:   "var(--font-body)",
                                fontSize:     "0.8rem",
                                fontWeight:   600,
                                textAlign:    "left",
                              }}
                            >
                              {new Date(slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                            </button>
                          ))}
                          {availableSlots.length === 0 && (
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-muted)" }}>No available slots right now.</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleReschedule(a.id)}
                          disabled={!newSlotId || actionLoading}
                          className="btn-primary"
                          style={{ fontSize: "0.825rem", padding: "0.4rem 1rem", opacity: newSlotId ? 1 : 0.5 }}
                        >
                          Confirm Reschedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/report" className="btn-primary">Book Another Appointment</Link>
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}