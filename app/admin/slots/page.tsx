"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TimeSlot {
  id:        string;
  startTime: string;
  endTime:   string;
  isBooked:  boolean;
}

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports"      },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/slots",        label: "Time Slots",   active: true },
  { href: "/admin/users",        label: "Users"        },
];

export default function AdminSlotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [slots, setSlots]       = useState<TimeSlot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime]     = useState("17:00");
  const [duration, setDuration]   = useState(30);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
    if (status === "authenticated") fetchSlots();
  }, [status]);

  async function fetchSlots() {
    const res = await fetch("/api/admin/slots");
    if (res.ok) setSlots(await res.json());
    setLoading(false);
  }

  function generateSlots() {
    const generated: { startTime: string; endTime: string }[] = [];
    const start = new Date(startDate);
    const end   = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);

      let current = new Date(d);
      current.setHours(sh, sm, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(eh, em, 0, 0);

      while (current < dayEnd) {
        const slotEnd = new Date(current.getTime() + duration * 60000);
        if (slotEnd > dayEnd) break;
        generated.push({ startTime: current.toISOString(), endTime: slotEnd.toISOString() });
        current = slotEnd;
      }
    }

    return generated;
  }

  async function handleCreateSlots(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setSuccess("");
    setError("");

    const generated = generateSlots();
    if (generated.length === 0) {
      setError("No slots generated. Check your date range and times.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/admin", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ slots: generated }),
    });

    if (res.ok) {
      setSuccess(`Created ${generated.length} time slot${generated.length !== 1 ? "s" : ""} successfully.`);
      await fetchSlots();
    } else {
      setError("Failed to create slots. Some may already exist for the selected dates.");
    }
    setCreating(false);
  }

  const upcomingSlots = slots.filter(s => new Date(s.startTime) >= new Date());
  const pastSlots     = slots.filter(s => new Date(s.startTime) <  new Date());

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
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Time Slots</h1>
          <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Create available appointment windows for residents to book.
          </p>
        </div>

        {/* Creation Form */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>Generate Slots</h2>
          <p style={{ color: "#6B7280", fontSize: "0.825rem", marginBottom: "1.25rem" }}>
            Automatically creates {duration}-minute slots on weekdays between the times you set. Weekends are skipped.
          </p>

          {success && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
              <p style={{ color: "#166534", fontSize: "0.875rem", margin: 0 }}>{success}</p>
            </div>
          )}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
              <p style={{ color: "#991B1B", fontSize: "0.875rem", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateSlots} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Start Date",        type: "date", value: startDate, onChange: setStartDate },
              { label: "End Date",          type: "date", value: endDate,   onChange: setEndDate   },
              { label: "Daily Start Time",  type: "time", value: startTime, onChange: setStartTime },
              { label: "Daily End Time",    type: "time", value: endTime,   onChange: setEndTime   },
            ].map(({ label, type, value, onChange }) => (
              <div key={label}>
                <label style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>{label}</label>
                <input type={type} required value={value} onChange={e => onChange(e.target.value)}
                  style={{ width: "100%", background: "#fff", border: "1px solid #D1D5DB", borderRadius: "6px", padding: "0.55rem 0.75rem", color: "#111827", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Session Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                style={{ width: "100%", background: "#fff", border: "1px solid #D1D5DB", borderRadius: "6px", padding: "0.55rem 0.75rem", color: "#111827", fontSize: "0.875rem" }}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" disabled={creating} style={{
                width: "100%", padding: "0.6rem", background: "#4F46E5", color: "#fff",
                border: "none", borderRadius: "6px", cursor: creating ? "not-allowed" : "pointer",
                fontWeight: 600, fontSize: "0.875rem", opacity: creating ? 0.7 : 1,
              }}>
                {creating ? "Creating…" : "Generate Slots"}
              </button>
            </div>
          </form>
        </div>

        {/* Upcoming slots */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>
            Upcoming Slots ({upcomingSlots.length})
          </h2>
          {upcomingSlots.length === 0 ? (
            <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>No upcoming slots. Generate some above.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem" }}>
              {upcomingSlots.slice(0, 30).map(slot => (
                <div key={slot.id} style={{
                  background:   slot.isBooked ? "#F0FDF4" : "#F9FAFB",
                  border:       `1px solid ${slot.isBooked ? "#BBF7D0" : "#E5E7EB"}`,
                  borderRadius: "6px", padding: "0.6rem 0.875rem",
                  display:      "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <p style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 500, margin: 0 }}>
                    {new Date(slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 600, padding: "0.15rem 0.45rem", borderRadius: "4px",
                    background: slot.isBooked ? "#D1FAE5" : "#F3F4F6",
                    color:      slot.isBooked ? "#065F46" : "#6B7280",
                  }}>
                    {slot.isBooked ? "Booked" : "Open"}
                  </span>
                </div>
              ))}
              {upcomingSlots.length > 30 && (
                <p style={{ color: "#6B7280", fontSize: "0.8rem", gridColumn: "1/-1" }}>
                  + {upcomingSlots.length - 30} more slots not shown
                </p>
              )}
            </div>
          )}
        </div>

        {/* Past slots summary */}
        {pastSlots.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1rem 1.5rem" }}>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", margin: 0 }}>
              {pastSlots.length} past slot{pastSlots.length !== 1 ? "s" : ""} not shown.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
