"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/navbar";

type Feedback = { type: "success" | "error"; msg: string } | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: "1.25rem" }}>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div style={{
      padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem",
      background: feedback.type === "success" ? "#D1FAE5" : "#FEE2E2",
      border: `1px solid ${feedback.type === "success" ? "#6EE7B7" : "#FECACA"}`,
      color: feedback.type === "success" ? "#065F46" : "#991B1B",
      fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500,
    }}>
      {feedback.msg}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Change email
  const [newEmail, setNewEmail]             = useState("");
  const [emailPassword, setEmailPassword]   = useState("");
  const [emailFeedback, setEmailFeedback]   = useState<Feedback>(null);
  const [emailLoading, setEmailLoading]     = useState(false);

  // Change password
  const [currentPw, setCurrentPw]           = useState("");
  const [newPw, setNewPw]                   = useState("");
  const [confirmPw, setConfirmPw]           = useState("");
  const [pwFeedback, setPwFeedback]         = useState<Feedback>(null);
  const [pwLoading, setPwLoading]           = useState(false);

  // Delete account
  const [showDelete, setShowDelete]         = useState(false);
  const [deletePw, setDeletePw]             = useState("");
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  if (status === "loading") return (
    <>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    </>
  );

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;
    setEmailLoading(true);
    setEmailFeedback(null);

    const res = await fetch("/api/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "email", newEmail, currentPassword: emailPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmailFeedback({ type: "success", msg: "Email updated. Your new email will be active on next sign-in." });
      setNewEmail("");
      setEmailPassword("");
    } else {
      setEmailFeedback({ type: "error", msg: data.error ?? "Failed to update email." });
    }
    setEmailLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) {
      setPwFeedback({ type: "error", msg: "New passwords do not match." });
      return;
    }
    setPwLoading(true);
    setPwFeedback(null);

    const res = await fetch("/api/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "password", currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwFeedback({ type: "success", msg: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } else {
      setPwFeedback({ type: "error", msg: data.error ?? "Failed to change password." });
    }
    setPwLoading(false);
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!deletePw) return;
    setDeleteLoading(true);
    setDeleteFeedback(null);

    const res = await fetch("/api/profile", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ currentPassword: deletePw }),
    });
    const data = await res.json();
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleteFeedback({ type: "error", msg: data.error ?? "Failed to delete account." });
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* Header */}
        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "3.5rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)", fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff" }}>My Profile</h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              {session?.user?.email}
            </p>
          </div>
        </section>

        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Change Email */}
          <Section title="Change Email Address">
            <FeedbackBanner feedback={emailFeedback} />
            <form onSubmit={handleEmailChange} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "0.35rem" }}>New Email Address</label>
                <input
                  type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="new@email.com"
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--color-bg-muted)", border: "1.5px solid var(--color-border)", borderRadius: "8px", padding: "0.65rem 0.875rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "0.35rem" }}>Current Password (to confirm)</label>
                <input
                  type="password" required value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--color-bg-muted)", border: "1.5px solid var(--color-border)", borderRadius: "8px", padding: "0.65rem 0.875rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-primary)" }}
                />
              </div>
              <button type="submit" disabled={emailLoading} className="btn-primary" style={{ alignSelf: "flex-start", fontSize: "0.875rem", padding: "0.5rem 1.25rem", opacity: emailLoading ? 0.6 : 1 }}>
                {emailLoading ? "Saving…" : "Update Email"}
              </button>
            </form>
          </Section>

          {/* Change Password */}
          <Section title="Change Password">
            <FeedbackBanner feedback={pwFeedback} />
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { label: "Current Password",     value: currentPw, onChange: setCurrentPw, placeholder: "••••••••" },
                { label: "New Password",          value: newPw,     onChange: setNewPw,     placeholder: "Min. 8 characters" },
                { label: "Confirm New Password",  value: confirmPw, onChange: setConfirmPw, placeholder: "••••••••" },
              ].map(({ label, value, onChange, placeholder }) => (
                <div key={label}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "0.35rem" }}>{label}</label>
                  <input
                    type="password" required value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--color-bg-muted)", border: "1.5px solid var(--color-border)", borderRadius: "8px", padding: "0.65rem 0.875rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-primary)" }}
                  />
                </div>
              ))}
              <button type="submit" disabled={pwLoading} className="btn-primary" style={{ alignSelf: "flex-start", fontSize: "0.875rem", padding: "0.5rem 1.25rem", opacity: pwLoading ? 0.6 : 1 }}>
                {pwLoading ? "Saving…" : "Change Password"}
              </button>
            </form>
          </Section>

          {/* Danger Zone */}
          <div className="card" style={{ border: "1.5px solid #FECACA" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#991B1B", marginBottom: "0.5rem" }}>Danger Zone</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.65 }}>
              Permanently delete your account and all associated data. Your filed reports will be anonymized and retained for record-keeping purposes. This cannot be undone.
            </p>

            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.5rem 1.25rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}
              >
                Delete My Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <FeedbackBanner feedback={deleteFeedback} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#DC2626", fontWeight: 600, margin: 0 }}>
                  Enter your password to confirm account deletion:
                </p>
                <input
                  type="password" required value={deletePw} onChange={e => setDeletePw(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: "var(--color-bg-muted)", border: "1.5px solid #FECACA", borderRadius: "8px", padding: "0.65rem 0.875rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-primary)", maxWidth: "320px" }}
                />
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    type="submit" disabled={deleteLoading}
                    style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", fontSize: "0.875rem", fontWeight: 600, cursor: deleteLoading ? "wait" : "pointer", fontFamily: "var(--font-body)", opacity: deleteLoading ? 0.7 : 1 }}
                  >
                    {deleteLoading ? "Deleting…" : "Yes, Delete My Account"}
                  </button>
                  <button
                    type="button" onClick={() => { setShowDelete(false); setDeletePw(""); setDeleteFeedback(null); }}
                    className="btn-outline" style={{ fontSize: "0.875rem" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}
