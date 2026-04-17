"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "./components/navbar";
import ChatBox from "./components/Chatbot";

// SLIDESHOW CONFIG
// To use real images: add files to /public/images/ and set the
// image field to e.g. "/images/slide1.jpg". Leave as null to
// use the gradient fallback.
const SLIDES = [
  {
    image: "/images/mural.jpg" as string | null,
    bg: "linear-gradient(135deg, #1E1A16 0%, #2C2118 60%, #1E1A16 100%)",
    label: "SpeakEqual",
    heading: "You Have the Right\nto Be Treated Fairly",
    body: "SpeakEqual is here to help you understand your civil rights, file a discrimination report, and connect with a trained advocate safely and confidentially.",
    cta: { label: "File a Report", href: "/report" },
    secondary: { label: "Know Your Rights", href: "/learnmore" },
  },
  {
    image: "/images/people.png" as string | null,
    bg: "linear-gradient(135deg, #1A1624 0%, #221833 60%, #1A1624 100%)",
    label: "In-Person Advocacy",
    heading: "Meet With an\nAdvocate Today",
    body: "Schedule a confidential in-person appointment with a trained SpeakEqual advocate who will listen to your situation and help you understand your options.",
    cta: { label: "Schedule an Appointment", href: "/report" },
    secondary: { label: "Learn How It Works", href: "/about" },
  },
  {
    image: "/images/durham.jpg" as string | null,
    bg: "linear-gradient(135deg, #161E1A 0%, #182C22 60%, #161E1A 100%)",
    label: "Know Your Rights",
    heading: "11 Protected Classes.\nOne Platform.",
    body: "From race and religion to veteran status and gender identity, learn which protections apply to you and what steps to take if they have been violated.",
    cta: { label: "Explore Your Rights", href: "/learnmore" },
    secondary: { label: "File a Report", href: "/report" },
  },
];

const QUICK_LINKS = [
  {
    title: "File a Report",
    desc: "Submit a discrimination report using our AI assistant or the manual form. No account required.",
    href: "/report",
    cta: "Report Now",
  },
  {
    title: "Schedule an Appointment",
    desc: "Book a confidential in-person session with a SpeakEqual advocate at a time that works for you.",
    href: "/report",
    cta: "Book a Time",
  },
  {
    title: "Know Your Rights",
    desc: "Plain-language guides on all 11 protected classes, applicable laws, and what to expect after filing.",
    href: "/learnmore",
    cta: "Learn More",
  },
  {
    title: "About SpeakEqual",
    desc: "Learn who we are, our mission, and the team behind the platform.",
    href: "/about",
    cta: "Meet the Team",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    setActiveSlide(i);
  }, []);

  const prev = useCallback(() => {
    setActiveSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
    setPaused(true);
  }, []);

  const next = useCallback(() => {
    setActiveSlide(s => (s + 1) % SLIDES.length);
    setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) {
      const resume = setTimeout(() => setPaused(false), 8000);
      return () => clearTimeout(resume);
    }
    const timer = setInterval(() => {
      setActiveSlide(s => (s + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = SLIDES[activeSlide];

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* HERO SLIDESHOW */}
        <section
          style={{
            backgroundImage:    slide.image ? `url(${slide.image})` : slide.bg,
            backgroundColor:    "#1E1A16",
            backgroundSize:     "cover",
            backgroundPosition: "center",
            padding:            "6rem 1.5rem 5rem",
            textAlign:          "center",
            position:           "relative",
            overflow:           "hidden",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slide.image && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          )}

          <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
            <span className="section-label" style={{ color: "#FFFFFF", marginBottom: "1rem", display: "block" }}>
              {slide.label}
            </span>
            <h1 style={{
              fontFamily:   "var(--font-heading)",
              fontSize:     "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight:   700,
              color:        "#FFFFFF",
              marginBottom: "1.25rem",
              lineHeight:   1.15,
              whiteSpace:   "pre-line",
            }}>
              {slide.heading}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize:   "1.1rem",
              color:      "rgba(255,255,255,0.82)",
              maxWidth:   "560px",
              margin:     "0 auto 2.25rem",
              lineHeight: 1.7,
            }}>
              {slide.body}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={slide.cta.href} className="btn-primary" style={{ background: "#fff", color: "var(--color-primary)", fontSize: "1rem", padding: "0.75rem 2rem" }}>
                {slide.cta.label}
              </Link>
              <Link href={slide.secondary.href} className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff", fontSize: "1rem", padding: "0.75rem 2rem" }}>
                {slide.secondary.label}
              </Link>
            </div>
          </div>

          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            style={{
              position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer",
              color: "#fff", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &#8249;
          </button>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next slide"
            style={{
              position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer",
              color: "#fff", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &#8250;
          </button>

          {/* Dot indicators */}
          <div style={{ position: "absolute", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem" }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); setPaused(true); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width:      activeSlide === i ? "24px" : "8px",
                  height:     "8px",
                  borderRadius: "999px",
                  background: activeSlide === i ? "#fff" : "rgba(255,255,255,0.4)",
                  border:     "none",
                  cursor:     "pointer",
                  padding:    0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </section>

        {/* PROTECTED CLASSES STRIP */}
        <section style={{ background: "var(--color-primary-light)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "1.25rem 1.5rem", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "nowrap", minWidth: "max-content", margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", marginRight: "0.5rem" }}>
              Protected classes:
            </span>
            {[
              { label: "Race",                 id: "race"               },
              { label: "Color",                id: "color"              },
              { label: "Religion",             id: "religion"           },
              { label: "Sex",                  id: "sex"                },
              { label: "National Origin",      id: "national_origin"    },
              { label: "Age 40+",              id: "age"                },
              { label: "Disability",           id: "disability"         },
              { label: "Sexual Orientation",   id: "sexual_orientation" },
              { label: "Gender Identity",      id: "gender_identity"    },
              { label: "Familial Status",      id: "familial_status"    },
              { label: "Veteran Status",       id: "veteran_status"     },
            ].map(({ label, id }) => (
              <Link key={id} href={`/learnmore#${id}`} style={{
                background:     "var(--color-primary)",
                color:          "#fff",
                fontSize:       "0.88rem",
                fontWeight:     600,
                padding:        "0.2rem 0.65rem",
                borderRadius:   "999px",
                whiteSpace:     "nowrap",
                textDecoration: "none",
              }}>{label}</Link>
            ))}
          </div>
        </section>

        {/* QUICK LINKS */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem 0" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="section-label">What We Offer</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2.1rem)", marginTop: "0.5rem" }}>
              How Can We Help You?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {QUICK_LINKS.map(({ title, desc, href, cta }) => (
              <div key={title} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem" }}>{title}</h3>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.65, flex: 1 }}>{desc}</p>
                <Link href={href} className="btn-primary" style={{ alignSelf: "flex-start", fontSize: "0.875rem", padding: "0.45rem 1.1rem" }}>{cta}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* AI ADVOCATE SECTION */}
        <section style={{ maxWidth: "960px", margin: "0 auto", padding: "4rem 1.5rem 0" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="section-label">AI Advocate</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2.1rem)", marginTop: "0.5rem", marginBottom: "0.6rem" }}>
              We&apos;re Here to Listen
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Ask any question about your rights, file a report, or book an appointment through a conversation. No forms, no pressure, no account required.
            </p>
          </div>
          <ChatBox mode="general" />
        </section>

        {/* SAFETY AND PRIVACY */}
        <section style={{ background: "var(--color-accent-light)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "3rem 1.5rem", marginTop: "4rem" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
              Your Safety and Privacy is our Top Priority
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              You are never required to create an account. Reports can be filed anonymously and appointments can be scheduled as walk-in sessions without providing personal information. SpeakEqual exists to create a safe, welcoming space for anyone who needs to voice a concern about discrimination and we will never require you to share more than you are comfortable with.
            </p>
            <Link href="/report" className="btn-primary" style={{ display: "inline-block" }}>
              Get Started
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.75rem" }}>
            SpeakEqual
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {[
              { label: "File a Report", href: "/report" },
              { label: "Know Your Rights", href: "/learnmore" },
              { label: "Schedule an Appointment", href: "/report" },
              { label: "About Us", href: "/about" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
            SpeakEqual is an independent platform dedicated to facilitating in-person advocacy appointments and civil rights education.
          </p>
        </footer>
      </main>
    </>
  );
}
