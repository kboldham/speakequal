"use client";

import { useState, useEffect } from "react";

interface TimeSlot {
  id:             string;
  startTime:      string;
  endTime:        string;
  schedulingUrl:  string;
}

const DAY_LABELS  = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth()         === b.getMonth()    &&
    a.getDate()          === b.getDate();
}

export default function AppointmentCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [month, setMonth]           = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelected] = useState<Date | null>(null);
  const [slots, setSlots]           = useState<TimeSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [configured, setConfigured] = useState(true);

  // Fetch available slots from Calendly via our server-side proxy whenever month changes
  useEffect(() => {
    setSlots([]);
    setLoading(true);
    fetch(`/api/slots?year=${month.getFullYear()}&month=${month.getMonth()}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSlots(data);
          setConfigured(true);
        } else {
          setConfigured(false);
        }
      })
      .catch(() => setConfigured(false))
      .finally(() => setLoading(false));
  }, [month]);

  // Build calendar grid
  const firstDOW    = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const totalCells  = Math.ceil((firstDOW + daysInMonth) / 7) * 7;

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDOW + 1;
    return d >= 1 && d <= daysInMonth
      ? new Date(month.getFullYear(), month.getMonth(), d)
      : null;
  });

  const hasSlots = (d: Date) => {
    const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    return dd >= today && slots.some(s => sameDay(new Date(s.startTime), d));
  };
  const isPast = (d: Date) => {
    const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    return dd < today;
  };

  const daySlots = selectedDate
    ? slots.filter(s => sameDay(new Date(s.startTime), selectedDate))
    : [];

  if (!configured) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#374151", marginBottom: "0.5rem" }}>Scheduling Setup Required</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#6B7280" }}>
          Set <code>CALENDLY_API_TOKEN</code> and <code>CALENDLY_EVENT_TYPE_URI</code> in your environment to enable online scheduling.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Calendar card */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

        {/* Month header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)" }}>
          <button
            onClick={() => { setSelected(null); setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)); }}
            style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", fontSize: "1.15rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >‹</button>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>
            {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
          </span>
          <button
            onClick={() => { setSelected(null); setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)); }}
            style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", fontSize: "1.15rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "1rem 0.75rem 0.5rem", borderBottom: "1px solid #F3F4F6" }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0.625rem 0.75rem 0.875rem", gap: "3px", minHeight: "200px", position: "relative" }}>
          {loading ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#9CA3AF" }}>Loading availability…</p>
            </div>
          ) : cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const past     = isPast(date);
            const has      = hasSlots(date);
            const isToday  = sameDay(date, today);
            const selected = selectedDate ? sameDay(date, selectedDate) : false;

            return (
              <button
                key={i}
                onClick={() => !past && has && setSelected(selected ? null : date)}
                disabled={past || !has}
                title={has ? `${date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} — times available` : undefined}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "3px", height: "46px", borderRadius: "10px",
                  border: selected
                    ? "2px solid #4338CA"
                    : isToday && !selected ? "2px solid #4F46E5" : "2px solid transparent",
                  background: selected ? "#4F46E5" : has ? "#EEF2FF" : "transparent",
                  cursor: past || !has ? "default" : "pointer",
                  opacity: past ? 0.3 : 1,
                  transition: "background 0.1s, border-color 0.1s",
                }}
              >
                <span style={{
                  fontSize: "0.875rem",
                  fontWeight: selected || isToday ? 700 : 400,
                  color: selected ? "#fff" : has ? "#3730A3" : "#6B7280",
                  lineHeight: 1,
                }}>
                  {date.getDate()}
                </span>
                {has && (
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: selected ? "rgba(255,255,255,0.8)" : "#4F46E5" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #F3F4F6", background: "#FAFAFA", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: "#EEF2FF", border: "1.5px solid #4F46E5" }} />
            <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Available</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: "#4F46E5" }} />
            <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Selected</span>
          </div>
        </div>
      </div>

      {/* Time slot panel */}
      {selectedDate && !loading && (
        <div style={{ marginTop: "1rem", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.15rem" }}>
                {daySlots.length} time{daySlots.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "1.25rem", cursor: "pointer", lineHeight: 1, padding: "0.25rem 0.5rem" }}
            >×</button>
          </div>

          <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {daySlots.map(slot => (
              <div key={slot.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.125rem", border: "1.5px solid #C7D2FE", borderRadius: "12px", background: "#F8FAFF" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827", margin: 0, fontFamily: "var(--font-body)" }}>
                    {new Date(slot.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    &nbsp;–&nbsp;
                    {new Date(slot.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: "0.2rem", fontFamily: "var(--font-body)" }}>
                    30 min · Zoom consultation
                  </p>
                </div>
                <a
                  href={slot.schedulingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: "#4F46E5", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem", fontSize: "0.825rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}
                >
                  Book
                </a>
              </div>
            ))}

            <p style={{ fontSize: "0.72rem", color: "#9CA3AF", textAlign: "center", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>
              You will complete your booking on Calendly. A Zoom link will be sent to your email automatically.
            </p>
          </div>
        </div>
      )}

      {!loading && slots.length === 0 && (
        <p style={{ marginTop: "1rem", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#6B7280", textAlign: "center" }}>
          No availability this month. Try the next month.
        </p>
      )}
    </div>
  );
}
