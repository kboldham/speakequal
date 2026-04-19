import Link from "next/link";

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports"      },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/slots",        label: "Availability", active: true },
  { href: "/admin/users",        label: "Users"        },
];

const STEPS = [
  { n: 1, title: "Create a Calendly account",     body: "Go to calendly.com and sign up or log in." },
  { n: 2, title: "Create an event type",          body: "Create a new event (e.g. \"30-Minute Consultation\") and connect your Zoom account so links are generated automatically." },
  { n: 3, title: "Copy your Event Type URI",      body: "In Calendly's developer settings or API explorer, find your event type URI (looks like https://api.calendly.com/event_types/XXXX). Set it as CALENDLY_EVENT_TYPE_URI in Vercel." },
  { n: 4, title: "Generate a Personal Access Token", body: "In Calendly → Integrations → API & Webhooks, create a Personal Access Token. Set it as CALENDLY_API_TOKEN in Vercel." },
  { n: 5, title: "Add the webhook",               body: "In Calendly → Integrations → Webhooks, add your webhook URL: https://yourdomain.com/api/webhooks/calendly. Copy the signing key and set it as CALENDLY_WEBHOOK_SIGNING_KEY in Vercel." },
];

export default function AdminSlotsPage() {
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
        <div style={{ marginTop: "auto", borderTop: "1px solid #E5E7EB", padding: "0.75rem 0.5rem 1rem" }}>
          <Link href="/" style={{ display: "block", padding: "0.5rem 0.75rem", color: "#6B7280", textDecoration: "none", fontSize: "0.8rem" }}>
            Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Availability</h1>
          <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Your availability is managed through Calendly. Residents book Zoom consultations via the scheduling calendar on the report page.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", maxWidth: "900px" }}>

          {/* Status card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>How It Works</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              {[
                "You set your availability in Calendly",
                "Our calendar pulls your open times via the Calendly API",
                "Residents pick a time and complete booking on Calendly",
                "Calendly generates a Zoom link and emails it to the resident",
                "A webhook records the appointment in this portal automatically",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, marginTop: "1px" }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "#374151", lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#4F46E5", color: "#fff", borderRadius: "6px", padding: "0.45rem 1rem", fontSize: "0.825rem", textDecoration: "none", fontWeight: 600 }}
            >
              Open Calendly Dashboard
            </a>
          </div>

          {/* Setup checklist */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>Setup Checklist</h2>
            <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "1rem" }}>
              Complete these steps once to enable live scheduling.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {STEPS.map(({ n, title, body }) => (
                <div key={n} style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, marginTop: "1px" }}>
                    {n}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.825rem", fontWeight: 600, color: "#111827", marginBottom: "0.15rem" }}>{title}</p>
                    <p style={{ fontSize: "0.78rem", color: "#6B7280", lineHeight: 1.55 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                Required env vars
              </p>
              {["CALENDLY_API_TOKEN", "CALENDLY_EVENT_TYPE_URI", "CALENDLY_WEBHOOK_SIGNING_KEY"].map(v => (
                <p key={v} style={{ fontSize: "0.78rem", color: "#6B7280", fontFamily: "monospace", lineHeight: 1.7 }}>{v}</p>
              ))}
            </div>
          </div>

        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <Link href="/admin/appointments" style={{ fontSize: "0.825rem", color: "#4F46E5", textDecoration: "none", fontWeight: 500 }}>
            View booked appointments →
          </Link>
        </div>
      </div>
    </main>
  );
}
