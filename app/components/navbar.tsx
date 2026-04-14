"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const learnMoreLinks = [
  { href: "/learnmore#employment",            label: "Employment"            },
  { href: "/learnmore#housing",               label: "Housing"               },
  { href: "/learnmore#public-accommodations", label: "Public Accommodations" },
  { href: "/learnmore#protected-classes",     label: "Protected Classes"     },
];

const mainLinks = [
  { href: "/",        label: "Home"          },
  { href: "/report",  label: "File a Report" },
  { href: "/about",   label: "About Us"      },
];

export default function Navbar() {
  const pathname   = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement>(null);

  const dashHref = session?.user?.role === "admin" ? "/admin" : "/dashboard";
  const isEducateActive = pathname.startsWith("/learnmore");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setLearnOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
          <Image
            src="/images/logo.png"
            alt="Speak Equal"
            width={32}
            height={32}
            style={{ borderRadius: "8px", objectFit: "cover" }}
          />
          <span style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "var(--color-text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}>
            Speak Equal
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hide-mobile">

          {/* Home */}
          <Link href="/" style={{
            padding:        "0.4rem 0.9rem",
            borderRadius:   "8px",
            fontFamily:     "var(--font-body)",
            fontWeight:     pathname === "/" ? 600 : 400,
            fontSize:       "0.9rem",
            color:          pathname === "/" ? "var(--color-primary)" : "var(--color-text-secondary)",
            background:     pathname === "/" ? "var(--color-primary-light)" : "transparent",
            textDecoration: "none",
            transition:     "all 0.15s",
          }}>
            Home
          </Link>

          {/* Learn More dropdown */}
          <div ref={learnRef} style={{ position: "relative" }}>
            <button
              onClick={() => setLearnOpen(o => !o)}
              style={{
                padding:      "0.4rem 0.9rem",
                borderRadius: "8px",
                fontFamily:   "var(--font-body)",
                fontWeight:   isEducateActive ? 600 : 400,
                fontSize:     "0.9rem",
                color:        isEducateActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                background:   isEducateActive ? "var(--color-primary-light)" : "transparent",
                border:       "none",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                gap:          "0.3rem",
                transition:   "all 0.15s",
              }}
            >
              Learn More
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: "transform 0.15s", transform: learnOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {learnOpen && (
              <div style={{
                position:   "absolute",
                top:        "calc(100% + 4px)",
                left:       0,
                background: "var(--color-nav-bg)",
                border:     "1px solid var(--color-border)",
                borderRadius: "10px",
                boxShadow:  "0 4px 20px rgba(0,0,0,0.1)",
                minWidth:   "210px",
                zIndex:     100,
                overflow:   "hidden",
              }}>
                {learnMoreLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setLearnOpen(false)}
                    style={{
                      display:        "block",
                      padding:        "0.65rem 1rem",
                      fontFamily:     "var(--font-body)",
                      fontSize:       "0.875rem",
                      color:          "var(--color-text-secondary)",
                      textDecoration: "none",
                      borderBottom:   "1px solid var(--color-border)",
                      transition:     "background 0.12s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-light)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* File a Report + About Us */}
          {mainLinks.slice(1).map(({ href, label }) => {
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
          <Link href="/" onClick={() => setMenuOpen(false)} style={{
            padding: "0.5rem 0.75rem", borderRadius: "8px",
            fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", textDecoration: "none",
          }}>
            Home
          </Link>

          {/* Learn More section in mobile */}
          <div>
            <div style={{
              padding: "0.5rem 0.75rem",
              fontFamily: "var(--font-body)", fontWeight: 600,
              fontSize: "0.875rem", color: "var(--color-text-primary)",
            }}>
              Learn More
            </div>
            {learnMoreLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                display: "block",
                padding: "0.4rem 0.75rem 0.4rem 1.5rem",
                fontFamily: "var(--font-body)", fontSize: "0.875rem",
                color: "var(--color-text-secondary)", textDecoration: "none",
              }}>
                {label}
              </Link>
            ))}
          </div>

          {mainLinks.slice(1).map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              padding: "0.5rem 0.75rem", borderRadius: "8px",
              fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", textDecoration: "none",
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
