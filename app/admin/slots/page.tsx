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

export default function AdminSlotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [slots, setSlots]           = useState<TimeSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);

  // Bulk slot creation form
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [startTime, setStartTime]   = useState("09:00");
  const [endTime, setEndTime]       = useState("17:00");
  const [duration, setDuration]     = useState(30);
  const [success, setSuccess]       = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
    if (status === "authenticated") fetchSlots();
  }, [status]);

  async function fetchSlots() {
    // Fetch all slots including booked ones for admin view
    const res = await fetch("/api/admin/slots");
    if (res.ok) setSlots(await res.json());
    setLoading(false);
  }

  // Generate slots between two dates within daily time bounds
  function generateSlots() {
    const generated: { startTime: string; endTime: string }[] = [];
    const start = new Date(startDate);
    const end   = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends
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

        generated.push({
          startTime: current.toISOString(),
          endTime:   slotEnd.toISOString(),
        });

        current = slotEnd;
      }
    }

    return generated;
  }

  async function handleCreateSlots(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setSuccess("");

    const slots = generateSlots();
    if (slots.length === 0) {
      alert("No slots generated. Check your date range and times.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/admin", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ slots }),
    });

    if (res.ok) {
      setSuccess(`Created ${slots.length} time slots successfully`);
      await fetchSlots();
    }
    setCreating(false);
  }

  const upcomingSlots = slots.filter(s => new Date(s.startTime) >= new Date());
  const pastSlots     = slots.filter(s => new Date(s.startTime) <  new Date());

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
            { href: "/admin",              icon: "", label: "Dashboard"    },
            { href: "/admin/reports",      icon: "", label: "Reports"     },
            { href: "/admin/appointments", icon: "", label: "Appointments"},
            { href: "/admin/slots",        icon: "", label: "Time Slots", active: true },
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
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "#F1F5F9", marginBottom: "0.5rem" }}>Time Slots</h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "2rem" }}>
          Create available appointment windows for residents to book.
        </p>

        {/* Creation Form */}
        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "1.75rem", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "#F1F5F9", fontSize: "1.2rem", marginBottom: "1.25rem" }}>
            Generate Slots
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.825rem", marginBottom: "1.25rem" }}>
            Automatically creates {duration}-minute slots on weekdays between the times you set. Weekends are skipped.
          </p>

          {success && (
            <div style={{ background: "#0F2A1E", border: "1px solid #166534", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
              <p style={{ color: "#34D399", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleCreateSlots} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Start Date</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1.5px solid #334155", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#F1F5F9", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>End Date</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1.5px solid #334155", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#F1F5F9", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Daily Start Time</label>
              <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1.5px solid #334155", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#F1F5F9", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Daily End Time</label>
              <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)}
                style={{ width: "100%", background: "#0F172A", border: "1.5px solid #334155", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#F1F5F9", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Session Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                style={{ width: "100%", background: "#0F172A", border: "1.5px solid #334155", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#F1F5F9", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" disabled={creating} style={{
                width: "100%", padding: "0.65rem", background: "#5e1515", color: "#fff",
                border: "none", borderRadius: "8px", cursor: "pointer",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem",
                opacity: creating ? 0.6 : 1,
              }}>
                {creating ? "Creating…" : "Generate Slots"}
              </button>
            </div>
          </form>
        </div>

        {/* Upcoming slots */}
        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "#F1F5F9", fontSize: "1.1rem", marginBottom: "1rem" }}>
            Upcoming Slots ({upcomingSlots.length})
          </h2>
          {upcomingSlots.length === 0 ? (
            <p style={{ color: "#64748B", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>No upcoming slots. Generate some above.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem" }}>
              {upcomingSlots.slice(0, 30).map(slot => (
                <div key={slot.id} style={{
                  background:   slot.isBooked ? "#1A3A2A" : "#0F172A",
                  border:       `1px solid ${slot.isBooked ? "#166534" : "#334155"}`,
                  borderRadius: "8px", padding: "0.6rem 0.875rem",
                  display:      "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{ color: "#CBD5E1", fontSize: "0.8rem", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                      {new Date(slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px",
                    background: slot.isBooked ? "#166534" : "#334155",
                    color:      slot.isBooked ? "#34D399" : "#64748B",
                  }}>
                    {slot.isBooked ? "Booked" : "Open"}
                  </span>
                </div>
              ))}
              {upcomingSlots.length > 30 && (
                <p style={{ color: "#64748B", fontSize: "0.8rem", fontFamily: "var(--font-body)", gridColumn: "1/-1" }}>
                  + {upcomingSlots.length - 30} more slots
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}