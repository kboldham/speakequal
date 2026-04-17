"use client";

import { useEffect, useState } from "react";

interface Note {
  id:        string;
  content:   string;
  createdAt: string;
}

export default function ReportNotes({ reportId }: { reportId: string }) {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchNotes();
  }, [open]);

  async function fetchNotes() {
    setLoading(true);
    const res = await fetch(`/api/reports/${reportId}/notes`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/reports/${reportId}/notes`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: text.trim() }),
    });
    if (res.ok) {
      setText("");
      await fetchNotes();
    }
    setSaving(false);
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", fontSize: "0.825rem",
          color: "var(--color-primary)", fontWeight: 600, padding: 0,
          display: "flex", alignItems: "center", gap: "0.35rem",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: "transform 0.15s", transform: open ? "rotate(90deg)" : "none" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        {open ? "Hide notes" : `Notes ${notes.length > 0 && !open ? `(${notes.length})` : ""}`}
      </button>

      {open && (
        <div style={{ marginTop: "0.875rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.875rem" }}>

          {/* Existing notes */}
          {loading ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-muted)" }}>Loading…</p>
          ) : notes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
              {notes.map(n => (
                <div key={n.id} style={{ background: "var(--color-bg-muted)", borderRadius: "8px", padding: "0.65rem 0.875rem" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>{n.content}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                    {new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              No notes yet. Add one below.
            </p>
          )}

          {/* Add note form */}
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a note, update, or additional detail…"
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--color-bg-muted)", border: "1.5px solid var(--color-border)",
                borderRadius: "8px", padding: "0.6rem 0.875rem",
                fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="btn-primary"
              style={{ alignSelf: "flex-start", fontSize: "0.825rem", padding: "0.4rem 1rem", opacity: saving || !text.trim() ? 0.6 : 1 }}
            >
              {saving ? "Saving…" : "Add Note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
