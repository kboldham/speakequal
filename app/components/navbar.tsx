"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const navLinks = [
  { href: "/",        label: "Home"    },
  { href: "/educate", label: "Learn More" },
  { href: "/report",  label: "Report"  },
  //{ href: "/resources",   label: "Resources"   },
  { href: "/about",   label: "About Us"   },
];

export default function Navbar() {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashHref = session?.user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav style={{
      background:   "var(--color-nav-bg)",
      borderBottom: "1px solid var(--color-border)",
      position:     "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: "1200px",
        margin:   "0 auto",
        padding:  "0 1.5rem",
        height:   "64px",
        display:  "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "var(--color-primary)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>D</span>
          </div>
          <span style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-text-primary)",
            lineHeight: 1.1,
          }}>
            Speak Equal<br />
            <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-body)", fontWeight: 400, color: "var(--color-text-muted)" }}>
              North Carolina Central University
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hide-mobile">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                padding:        "0.4rem 0.9rem",
                borderRadius:   "8px",
                fontFamily:     "var(--font-body)",
                fontWeight:     active ? 600 : 400,
                fontSize:       "0.9rem",
                color:          active ? "var(--color-primary)" : "var(--color-text-secondary)",
                background:     active ? "var(--color-primary-light)" : "transparent",
                textDecoration: "none",
                transition:     "all 0.15s",
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="hide-mobile">
          {session ? (
            <>
              <Link href={dashHref} className="btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-primary"
                style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}
        >
          <div style={{ width: "22px", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ height: "2px", background: "var(--color-text-primary)", borderRadius: "2px", display: "block" }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          borderTop: "1px solid var(--color-border)",
          padding:   "1rem 1.5rem",
          display:   "flex",
          flexDirection: "column",
          gap: "0.5rem",
          background: "var(--color-nav-bg)",
        }}>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              padding:        "0.5rem 0.75rem",
              borderRadius:   "8px",
              fontFamily:     "var(--font-body)",
              color:          "var(--color-text-secondary)",
              textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
          <hr style={{ borderColor: "var(--color-border)", margin: "0.5rem 0" }} />
          {session ? (
            <>
              <Link href={dashHref} onClick={() => setMenuOpen(false)} className="btn-outline">Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="btn-outline">Sign In</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
