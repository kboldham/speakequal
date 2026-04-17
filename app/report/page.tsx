"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import ChatBox from "../components/Chatbot";

const DISCRIMINATION_TYPES = [
  { value: "race",               label: "Race" },
  { value: "color",              label: "Color" },
  { value: "religion",           label: "Religion" },
  { value: "sex",                label: "Sex" },
  { value: "national_origin",    label: "National Origin" },
  { value: "age",                label: "Age (40+)" },
  { value: "disability",         label: "Disability" },
  { value: "sexual_orientation", label: "Sexual Orientation" },
  { value: "gender_identity",    label: "Gender Identity or Expression" },
  { value: "familial_status",    label: "Familial Status" },
  { value: "veteran_status",     label: "Veteran Status" },
];

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function ReportPage() {
  const [slots, setSlots] = useState<{ id: string; startTime: string; endTime: string }[]>([]);

  // Which manual section is open (null = both collapsed)
  const [openSection, setOpenSection] = useState<"report" | "appointment" | null>(null);

  // Report form state — core fields
  const [reportForm, setReportForm] = useState({ incidentDate: "", discriminationType: "", description: "" });
  const [category, setCategory]         = useState("");
  // Complainant contact (all optional)
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [address, setAddress]           = useState("");
  const [zipCode, setZipCode]           = useState("");
  // Respondent info (all optional)
  const [respondentName, setRespondentName]         = useState("");
  const [respondentAddress, setRespondentAddress]   = useState("");
  const [respondentPhone, setRespondentPhone]       = useState("");

  const [attachments, setAttachments]         = useState<File[]>([]);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading]     = useState(false);

  // Appointment form state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [apptReason, setApptReason]     = useState("");
  const [apptAnon, setApptAnon]         = useState(false);
  const [apptSubmitted, setApptSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/appointments").then(r => r.json()).then(setSlots).catch(() => {});
  }, []);

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReportLoading(true);
    try {
      const uploadedAttachments: { fileName: string; fileUrl: string; fileType: string }[] = [];
      for (const file of attachments) {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        uploadedAttachments.push(data);
      }
      await fetch("/api/reports", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportForm,
          category,
          firstName:         firstName         || null,
          lastName:          lastName          || null,
          phone:             phone             || null,
          address:           address           || null,
          zipCode:           zipCode           || null,
          respondentName:    respondentName    || null,
          respondentAddress: respondentAddress || null,
          respondentPhone:   respondentPhone   || null,
          attachments: uploadedAttachments,
        }),
      });
      setReportSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  }

  async function handleApptSubmit() {
    if (!selectedSlot) return;
    await fetch("/api/appointments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selectedSlot, reason: apptReason, source: "calendar", anonymous: apptAnon }),
    });
    setApptSubmitted(true);
  }

  function toggleSection(section: "report" | "appointment") {
    setOpenSection(prev => prev === section ? null : section);
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)",
          padding:    "4rem 1.5rem 3rem",
          textAlign:  "center",
        }}>
          <span className="section-label" style={{ color: "rgba(255,255,255,0.75)", display: "block", marginBottom: "0.75rem" }}>
            SpeakEqual
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            Tell Us What Happened
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", maxWidth: "540px", margin: "0 auto", fontSize: "0.975rem", lineHeight: 1.75 }}>
            Our AI advocate will walk you through the process filing a report, booking an appointment, or simply answering your questions. You are never required to create an account.
          </p>
        </section>

        {/* ── TWO-COLUMN WRAPPER ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── AI CHATBOT — MAIN FEATURE ── */}
        <section style={{ padding: "2.5rem 0 1rem" }}>

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{
              background:   "var(--color-primary)",
              color:        "#fff",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.72rem",
              fontWeight:   700,
              letterSpacing:"0.08em",
              textTransform:"uppercase",
              padding:      "0.3rem 0.75rem",
              borderRadius: "999px",
            }}>
              AI Advocate
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              File a report, book an appointment, or ask any question
            </p>
          </div>

          <ChatBox mode="general" />
        </section>

        {/* ── PREFER TO DO IT YOURSELF? ── */}
        <section style={{ padding: "1.5rem 0 3rem" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
              Prefer to do it yourself?
            </p>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>

            {/* ── FILE A REPORT MANUALLY ── */}
            <div style={{ border: "1px solid var(--color-border)", borderRadius: "16px", overflow: "hidden", background: "var(--color-bg-card)" }}>
              <button
                onClick={() => toggleSection("report")}
                style={{
                  width:        "100%",
                  padding:      "1.1rem 1.25rem",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent:"space-between",
                  background:   "none",
                  border:       "none",
                  cursor:       "pointer",
                  textAlign:    "left",
                }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                    File a Report Manually
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                    Fill out the form yourself
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", color: "var(--color-text-muted)", transform: openSection === "report" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  ↓
                </span>
              </button>

              {openSection === "report" && (
                <div style={{ borderTop: "1px solid var(--color-border)", padding: "1.25rem" }}>
                  {reportSubmitted ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Report Submitted</h3>
                      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        Thank you. SpeakEqual will review your report.
                      </p>
                      <button onClick={() => setReportSubmitted(false)} className="btn-outline" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                        Submit another
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                      {/* ── Section 1: Your Contact Info ── */}
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                          Your Contact Information
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                          All fields are optional. You may submit this report anonymously.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>First Name</label>
                            <input type="text" className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                          </div>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Last Name</label>
                            <input type="text" className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                          </div>
                        </div>
                        <div style={{ marginTop: "0.75rem" }}>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Phone</label>
                          <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Street Address</label>
                            <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
                          </div>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Zip Code</label>
                            <input type="text" className="form-input" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="27701" />
                          </div>
                        </div>
                      </div>

                      {/* ── Section 2: Respondent Info ── */}
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                          Who Is This Complaint Against?
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                          The business, employer, landlord, or individual. All fields are optional.
                        </p>
                        <div>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Name</label>
                          <input type="text" className="form-input" value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Business or person name" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Address</label>
                            <input type="text" className="form-input" value={respondentAddress} onChange={e => setRespondentAddress(e.target.value)} placeholder="123 Main St" />
                          </div>
                          <div>
                            <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Phone</label>
                            <input type="tel" className="form-input" value={respondentPhone} onChange={e => setRespondentPhone(e.target.value)} placeholder="(555) 000-0000" />
                          </div>
                        </div>
                      </div>

                      {/* ── Section 3: About the Incident ── */}
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
                          About the Incident
                        </p>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                            Category *
                          </label>
                          <select
                            required
                            className="form-input"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                          >
                            <option value="">Select a category…</option>
                            <option value="employment">Employment</option>
                            <option value="fair_housing">Fair Housing</option>
                            <option value="public_accommodations">Public Accommodations</option>
                            <option value="other">Other (Education, Voting, Credit, Government Services, etc.)</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                            Protected Class *
                          </label>
                          <select
                            required
                            className="form-input"
                            value={reportForm.discriminationType}
                            onChange={e => setReportForm(f => ({ ...f, discriminationType: e.target.value }))}
                          >
                            <option value="">Select the protected class that applies…</option>
                            {DISCRIMINATION_TYPES.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                            Date of Incident *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            className="form-input"
                            value={reportForm.incidentDate}
                            onChange={e => setReportForm(f => ({ ...f, incidentDate: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.2rem" }}>
                            Description *
                          </label>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: "var(--color-text-muted)", marginBottom: "0.4rem", lineHeight: 1.5 }}>
                            Include: what adverse action occurred (e.g., denied housing, fired, refused service), why you believe your protected class was a factor, and why you were qualified (e.g., met credit requirements, had the required experience).
                          </p>
                          <textarea
                            required
                            rows={5}
                            className="form-input"
                            placeholder="Describe what happened in your own words…"
                            value={reportForm.description}
                            onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                            style={{ resize: "vertical" }}
                          />
                        </div>
                      </div>

                      {/* ── Section 4: Attachments ── */}
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
                        <label style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                          Supporting Evidence (optional)
                        </label>
                        <div style={{ border: "2px dashed var(--color-border)", borderRadius: "10px", padding: "1rem", textAlign: "center", background: "var(--color-bg-muted)" }}>
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            style={{ display: "none" }}
                            id="file-upload"
                            onChange={e => setAttachments(Array.from(e.target.files ?? []))}
                          />
                          <label htmlFor="file-upload" style={{ cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                            Click to upload files (images, PDFs, documents)
                          </label>
                          {attachments.length > 0 && (
                            <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.35rem", justifyContent: "center" }}>
                              {attachments.map(f => (
                                <span key={f.name} style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "999px", fontFamily: "var(--font-body)" }}>
                                  {f.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button type="submit" className="btn-primary" disabled={reportLoading} style={{ fontSize: "0.925rem", padding: "0.7rem" }}>
                        {reportLoading ? "Submitting…" : "Submit Report"}
                      </button>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center" }}>
                        No account required. You may submit anonymously.
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* ── BOOK APPOINTMENT MANUALLY ── */}
            <div style={{ border: "1px solid var(--color-border)", borderRadius: "16px", overflow: "hidden", background: "var(--color-bg-card)" }}>
              <button
                onClick={() => toggleSection("appointment")}
                style={{
                  width:        "100%",
                  padding:      "1.1rem 1.25rem",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent:"space-between",
                  background:   "none",
                  border:       "none",
                  cursor:       "pointer",
                  textAlign:    "left",
                }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                    Book an Appointment
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                    Browse available time slots
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", color: "var(--color-text-muted)", transform: openSection === "appointment" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  ↓
                </span>
              </button>

              {openSection === "appointment" && (
                <div style={{ borderTop: "1px solid var(--color-border)", padding: "1.25rem" }}>
                  {apptSubmitted ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📅</div>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Appointment Booked</h3>
                      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        Your appointment has been confirmed.
                      </p>
                      <button onClick={() => setApptSubmitted(false)} className="btn-outline" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                        Book another
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                        In-person sessions at 101 City Hall Plaza, Durham, NC 27701.
                      </p>

                      {/* Slot grid */}
                      {slots.length === 0 ? (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                          No available slots right now. Check back soon or ask the AI assistant above.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.6rem" }}>
                          {slots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                              style={{
                                padding:      "0.75rem",
                                borderRadius: "10px",
                                border:       `2px solid ${selectedSlot === slot.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                background:   selectedSlot === slot.id ? "var(--color-primary-light)" : "var(--color-bg-card)",
                                cursor:       "pointer",
                                textAlign:    "left",
                                transition:   "all 0.15s",
                              }}
                            >
                              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.82rem", color: selectedSlot === slot.id ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                                {formatSlot(slot.startTime)}
                              </p>
                              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>30 min session</p>
                            </button>
                          ))}
                        </div>
                      )}

                      <div>
                        <label style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                          Reason (optional)
                        </label>
                        <textarea
                          rows={2}
                          className="form-input"
                          placeholder="Briefly describe why you'd like to meet…"
                          value={apptReason}
                          onChange={e => setApptReason(e.target.value)}
                          style={{ resize: "vertical" }}
                        />
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={apptAnon}
                          onChange={e => setApptAnon(e.target.checked)}
                          style={{ width: "15px", height: "15px", accentColor: "var(--color-primary)" }}
                        />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>
                          Book anonymously
                        </span>
                      </label>

                      <button
                        className="btn-primary"
                        disabled={!selectedSlot}
                        onClick={handleApptSubmit}
                        style={{ fontSize: "0.925rem", padding: "0.7rem", opacity: selectedSlot ? 1 : 0.5 }}
                      >
                        Confirm Appointment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

        </div>{/* end left column */}

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="report-sidebar" style={{ width: "300px", flexShrink: 0, position: "sticky", top: "80px" }}>

          {/* Card 1 — Retaliation */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <span className="section-label" style={{ display: "block", marginBottom: "0.6rem" }}>Know Your Rights</span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "0.75rem" }}>What is Retaliation?</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "0.875rem" }}>
              Retaliation occurs when an employer or individual takes a negative action against you specifically because you filed a report or participated in an investigation. It is often illegal and violates most company policies.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Common Examples
            </p>
            <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.875rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {[
                "Sudden demotion or salary reduction",
                "Exclusion from important meetings or projects",
                "Hostile behavior or social freezing by management",
                "Unexpectedly poor performance reviews",
              ].map(ex => (
                <li key={ex} style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{ex}</li>
              ))}
            </ul>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              <strong style={{ color: "var(--color-text-primary)" }}>Your Right:</strong> Reporting a concern in good faith protects you. If you feel you are being treated differently after your report, document these instances immediately and report them as a secondary retaliation claim.
            </p>
          </div>

          {/* Card 2 — After You Submit */}
          <div className="card">
            <span className="section-label" style={{ display: "block", marginBottom: "0.6rem" }}>Next Steps</span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "0.875rem" }}>What Happens Next</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { n: 1, title: "Secure Your Documentation", body: "Keep a private copy of your submitted report and confirmation. Save any evidence in a secure, non-work location such as a personal cloud drive." },
                { n: 2, title: "Maintain Confidentiality", body: "Avoid discussing the details of the report with coworkers or on social media to keep the investigation clean and avoid alerting the subject." },
                { n: 3, title: "Monitor for Status Updates", body: "Check your inbox or this portal regularly. Investigators may need follow-up answers from you, and delays can stall the case." },
                { n: 4, title: "Record Subsequent Interactions", body: "Keep a log of any interactions with the subjects of the report or management. Note the date, time, location, and what was said." },
                { n: 5, title: "Seek Support", body: "Investigations can be emotionally draining. If your organization has an Employee Assistance Program or a trusted mentor, reach out for support." },
              ].map(({ n, title, body }) => (
                <div key={n} style={{ display: "flex", gap: "0.75rem" }}>
                  <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-body)", marginTop: "1px" }}>
                    {n}
                  </span>
                  <div>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.825rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.2rem" }}>{title}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

        </div>{/* end two-column wrapper */}

        <style>{`
          @media (max-width: 768px) { .report-sidebar { display: none !important; } }
        `}</style>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>
            SpeakEqual
          </p>
        </footer>
      </main>
    </>
  );
}
