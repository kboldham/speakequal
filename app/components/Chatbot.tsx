"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Message {
  role:    "user" | "assistant";
  content: string;
}

interface Conversation {
  id:        string;
  title:     string;
  updatedAt: string;
}

interface Slot {
  id:        string;
  startTime: string;
  endTime:   string;
}

interface ChatBoxProps {
  /** "report" shows report-specific greeting, "appointment" shows appointment greeting, "general" for homepage */
  mode?: "report" | "appointment" | "general";
}

// ─────────────────────────────────────────────────────────────
// GREETINGS PER MODE
// ─────────────────────────────────────────────────────────────
const GREETINGS: Record<string, string> = {
  report:      "Hello, I'm here to help you file a discrimination report. I'll ask you a few questions to gather the details. Can you start by telling me approximately when the incident occurred?",
  appointment: "Hello! I can help you schedule an in-person appointment. Would you prefer a morning or afternoon session, and do you have any particular dates in mind?",
  general:     "Hello! I'm here to help Durham residents with discrimination-related questions, filing reports, and scheduling appointments. What can I help you with today?",
};

// ─────────────────────────────────────────────────────────────
// CHATBOX COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChatBox({ mode = "general" }: ChatBoxProps) {
  const { data: session } = useSession();

  const [messages, setMessages]               = useState<Message[]>([]);
  const [input, setInput]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [conversationId, setConversationId]   = useState<string | null>(null);
  const [conversations, setConversations]     = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar]         = useState(false);
  const [availableSlots, setAvailableSlots]   = useState<Slot[]>([]);
  const [showSlotPicker, setShowSlotPicker]   = useState(false);
  const [pendingReason, setPendingReason]     = useState<string>("");
  const [slotBooked, setSlotBooked]           = useState(false);
  const [reportCreated, setReportCreated]     = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load past conversations if logged in
  useEffect(() => {
    if (session?.user?.id) fetchConversations();
  }, [session]);

  // Load available slots for appointment picker
  useEffect(() => {
    fetch("/api/appointments")
      .then(r => r.json())
      .then(setAvailableSlots)
      .catch(() => {});
  }, []);

  async function fetchConversations() {
    const res = await fetch("/api/chat");
    if (res.ok) setConversations(await res.json());
  }

  async function loadConversation(id: string) {
    // Fetch messages for selected conversation
    const res = await fetch(`/api/chat/conversation/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages.map((m: { role: "user" | "assistant"; content: string }) => ({
        role:    m.role,
        content: m.content,
      })));
      setConversationId(id);
      setShowSidebar(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: userMessage, conversationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.error ?? "Something went wrong. Please try again." }]);
        setLoading(false);
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      setConversationId(data.conversationId);

      // Report was auto-created by AI
      if (data.createdReport) {
        setReportCreated(true);
      }

      // AI wants to book an appointment — show slot picker
      if (data.appointmentIntent) {
        setPendingReason(data.appointmentIntent.reason ?? "");
        setShowSlotPicker(true);
      }

      // Refresh conversation list
      if (session?.user?.id) fetchConversations();

    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your internet and try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function bookSlot(slotId: string) {
    const res = await fetch("/api/appointments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        slotId,
        reason:         pendingReason,
        source:         "ai",
        conversationId: conversationId ?? undefined,
      }),
    });

    if (res.ok) {
      setSlotBooked(true);
      setShowSlotPicker(false);
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Your appointment has been booked! You'll receive a confirmation. Is there anything else I can help you with?",
      }]);
    }
  }

  function startNewChat() {
    setMessages([]);
    setConversationId(null);
    setReportCreated(false);
    setSlotBooked(false);
    setShowSlotPicker(false);
    setShowSidebar(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const greeting = GREETINGS[mode];
  const isLoggedIn = !!session?.user?.id;

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>

      {/* ── CONVERSATION SIDEBAR ── */}
      {isLoggedIn && showSidebar && (
        <div style={{
          width:        "220px",
          background:   "var(--color-bg-card)",
          border:       "1px solid var(--color-border)",
          borderRadius: "14px",
          padding:      "1rem",
          flexShrink:   0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Past Chats
            </p>
            <button onClick={startNewChat} style={{ background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
              + New
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {conversations.length === 0 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>No past conversations.</p>
            )}
            {conversations.map(c => (
              <button key={c.id} onClick={() => loadConversation(c.id)} style={{
                background:   conversationId === c.id ? "var(--color-primary-light)" : "transparent",
                border:       `1px solid ${conversationId === c.id ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: "8px",
                padding:      "0.5rem 0.65rem",
                textAlign:    "left",
                cursor:       "pointer",
                width:        "100%",
              }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: conversationId === c.id ? "var(--color-primary)" : "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.title || "Conversation"}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                  {new Date(c.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CHAT BOX ── */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0", padding: 0, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Assistant
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {isLoggedIn && (
              <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "0.25rem 0.65rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                {showSidebar ? "Hide History" : "Past Chats"}
              </button>
            )}
            {messages.length > 0 && (
              <button onClick={startNewChat} style={{ background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "0.25rem 0.65rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                New Chat
              </button>
            )}
          </div>
        </div>

        {/* Not logged in warning */}
        {!isLoggedIn && (
          <div style={{ padding: "0.6rem 1.25rem", background: "var(--color-primary-light)", borderBottom: "1px solid #dbe8f8" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-primary)" }}>
              <Link href="/auth/signin" style={{ fontWeight: 700, color: "var(--color-primary)" }}>Sign in</Link> to save your conversation and track your report.
            </p>
          </div>
        )}

        {/* Messages */}
        <div style={{
          padding:        "1.25rem",
          minHeight:      "320px",
          maxHeight:      "480px",
          overflowY:      "auto",
          display:        "flex",
          flexDirection:  "column",
          gap:            "0.875rem",
        }}>

          {/* Greeting bubble */}
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>AI</span>
            </div>
            <div style={{ background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: "12px 12px 12px 2px", padding: "0.75rem 1rem", maxWidth: "85%" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)", lineHeight: 1.6 }}>
                {greeting}
              </p>
            </div>
          </div>

          {/* Conversation messages */}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "var(--color-accent)" : "var(--color-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>
                  {msg.role === "user" ? "You" : "AI"}
                </span>
              </div>
              <div style={{
                background:   msg.role === "user" ? "var(--color-primary)" : "var(--color-bg-muted)",
                border:       `1px solid ${msg.role === "user" ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                padding:      "0.75rem 1rem",
                maxWidth:     "85%",
              }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: msg.role === "user" ? "#fff" : "var(--color-text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>AI</span>
              </div>
              <div style={{ background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: "12px 12px 12px 2px", padding: "0.875rem 1rem" }}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "var(--color-text-muted)",
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Report created confirmation */}
          {reportCreated && (
            <div style={{ background: "var(--color-accent-light)", border: "1px solid #c6eedd", borderRadius: "10px", padding: "0.875rem 1rem" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: 600 }}>
                ✅ Your report has been submitted successfully.
              </p>
              {isLoggedIn && (
                <Link href="/dashboard/reports" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
                  View your reports →
                </Link>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Slot Picker */}
        {showSlotPicker && (
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", background: "var(--color-primary-light)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
              📅 Select an appointment time:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {availableSlots.slice(0, 6).map(slot => (
                <button key={slot.id} onClick={() => bookSlot(slot.id)} style={{
                  padding:      "0.6rem 0.75rem",
                  borderRadius: "8px",
                  border:       "1.5px solid var(--color-primary)",
                  background:   "#fff",
                  color:        "var(--color-primary)",
                  fontFamily:   "var(--font-body)",
                  fontSize:     "0.8rem",
                  fontWeight:   600,
                  cursor:       "pointer",
                  textAlign:    "left",
                  transition:   "all 0.12s",
                }}>
                  {new Date(slot.startTime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                </button>
              ))}
              {availableSlots.length === 0 && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                  No available slots. <Link href="/report" style={{ color: "var(--color-primary)", fontWeight: 600 }}>View calendar →</Link>
                </p>
              )}
            </div>
            <button onClick={() => setShowSlotPicker(false)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "0.75rem" }}>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="Type your message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ whiteSpace: "nowrap", opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}