"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserRow {
  id:        string;
  name:      string | null;
  email:     string;
  role:      string;
  createdAt: string;
  _count:    { reports: number; appointments: number };
}

const NAV = [
  { href: "/admin",              label: "Dashboard"    },
  { href: "/admin/reports",      label: "Reports"      },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/slots",        label: "Availability" },
  { href: "/admin/users",        label: "Users",        active: true },
];

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers]                 = useState<UserRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionUserId, setActionUserId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback]           = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
    if (status === "authenticated") fetchUsers();
  }, [status]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function handleSetRole(userId: string, newRole: "user" | "admin") {
    setActionUserId(userId);
    const res = await fetch("/api/admin/users", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, action: "setRole", role: newRole }),
    });
    if (res.ok) {
      setFeedback({ type: "success", msg: `Role updated to ${newRole}.` });
      await fetchUsers();
    } else {
      const d = await res.json();
      setFeedback({ type: "error", msg: d.error ?? "Failed to update role." });
    }
    setActionUserId(null);
  }

  async function handleResetPassword(userId: string, email: string) {
    setActionUserId(userId);
    const res = await fetch("/api/admin/users", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, action: "resetPassword" }),
    });
    if (res.ok) {
      setFeedback({ type: "success", msg: `Password reset email sent to ${email}.` });
    } else {
      setFeedback({ type: "error", msg: "Failed to send reset email." });
    }
    setActionUserId(null);
  }

  async function handleDelete(userId: string) {
    setActionUserId(userId);
    const res = await fetch("/api/admin/users", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId }),
    });
    if (res.ok) {
      setFeedback({ type: "success", msg: "User deleted." });
      setConfirmDelete(null);
      await fetchUsers();
    } else {
      const d = await res.json();
      setFeedback({ type: "error", msg: d.error ?? "Failed to delete user." });
    }
    setActionUserId(null);
  }

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

        {feedback && (
          <div style={{
            marginBottom: "1.25rem", padding: "0.75rem 1rem", borderRadius: "6px",
            background: feedback.type === "success" ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${feedback.type === "success" ? "#BBF7D0" : "#FECACA"}`,
            color: feedback.type === "success" ? "#166534" : "#991B1B",
            fontSize: "0.875rem", fontWeight: 500,
          }}>
            {feedback.msg}
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Users</h1>
          <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
        </div>

        {users.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4rem", textAlign: "center" }}>
            <p style={{ color: "#6B7280" }}>No users found.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
                  {["Email", "Role", "Reports", "Appointments", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#6B7280", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isSelf    = u.id === session?.user?.id;
                  const isWorking = actionUserId === u.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <p style={{ color: "#111827", fontWeight: 500, margin: 0 }}>{u.email}</p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{
                          background: u.role === "admin" ? "#EEF2FF" : "#F3F4F6",
                          color:      u.role === "admin" ? "#4338CA" : "#374151",
                          border:     `1px solid ${u.role === "admin" ? "#C7D2FE" : "#E5E7EB"}`,
                          fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", textTransform: "uppercase",
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#374151", textAlign: "center" }}>{u._count.reports}</td>
                      <td style={{ padding: "0.875rem 1rem", color: "#374151", textAlign: "center" }}>{u._count.appointments}</td>
                      <td style={{ padding: "0.875rem 1rem", color: "#6B7280", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {confirmDelete === u.id ? (
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ color: "#DC2626", fontSize: "0.78rem" }}>Are you sure?</span>
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={isWorking}
                              style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: "5px", padding: "0.25rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: "5px", padding: "0.25rem 0.6rem", fontSize: "0.75rem", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleSetRole(u.id, u.role === "admin" ? "user" : "admin")}
                              disabled={isSelf || isWorking}
                              title={isSelf ? "Cannot change your own role" : undefined}
                              style={{
                                background: "#F3F4F6", color: isSelf ? "#9CA3AF" : "#374151",
                                border: "1px solid #E5E7EB", borderRadius: "5px",
                                padding: "0.25rem 0.6rem", fontSize: "0.75rem",
                                cursor: isSelf ? "not-allowed" : "pointer", fontWeight: 500,
                              }}
                            >
                              {u.role === "admin" ? "Demote" : "Promote"}
                            </button>
                            <button
                              onClick={() => handleResetPassword(u.id, u.email)}
                              disabled={isWorking}
                              style={{ background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", borderRadius: "5px", padding: "0.25rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              disabled={isSelf || isWorking}
                              title={isSelf ? "Cannot delete your own account" : undefined}
                              style={{
                                background: "#FEF2F2", color: isSelf ? "#FCA5A5" : "#991B1B",
                                border: "1px solid #FECACA", borderRadius: "5px",
                                padding: "0.25rem 0.6rem", fontSize: "0.75rem",
                                cursor: isSelf ? "not-allowed" : "pointer", fontWeight: 500,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
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
