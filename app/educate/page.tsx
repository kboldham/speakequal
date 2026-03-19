"use client";

import { useState } from "react";
import Navbar from "../components/navbar";

const PROTECTED_CLASSES = [
  {
    id: "race",
    title: "Race",
    icon: "",
    summary: "Protection from discrimination based on race or racial characteristics.",
    content: `Under Title VII of the Civil Rights Act of 1964 and Durham City Code Chapter 18, 
    it is unlawful to discriminate against any person based on their race in employment, housing, 
    and public accommodations. This includes decisions about hiring, firing, pay, job assignments, 
    promotions, layoffs, training, or any other term or condition of employment.`,
    examples: ["Being passed over for promotion due to race", "Racially hostile work environment", "Denial of housing based on race"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18", "NC Equal Employment Practices Act"],
  },
  {
    id: "color",
    title: "Color",
    icon: "",
    summary: "Protection from discrimination based on skin color, separate from race.",
    content: `Color discrimination involves treating someone unfavorably because of skin color 
    complexion. This can occur between persons of the same race or ethnic group, not just between 
    different groups. Durham prohibits this as a distinct protected class.`,
    examples: ["Different treatment based on skin tone within the same racial group", "Colorism in hiring decisions"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18"],
  },
  {
    id: "religion",
    title: "Religion",
    icon: "",
    summary: "Protection of religious beliefs and practices, including reasonable accommodations.",
    content: `Religious discrimination involves treating a person unfavorably because of their 
    religious beliefs. The law protects not only people who belong to traditional, organized religions, 
    but also others who have sincerely held religious, ethical, or moral beliefs. Employers and 
    housing providers must make reasonable accommodations for religious practices.`,
    examples: ["Refusing to accommodate prayer times", "Requiring removal of religious attire", "Harassment about religious practices"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18"],
  },
  {
    id: "sex",
    title: "Sex",
    icon: "",
    summary: "Includes pregnancy discrimination and gender-based treatment.",
    content: `Sex discrimination includes unfavorable treatment because of a person's sex, 
    including pregnancy, childbirth, and related medical conditions. It also covers sexual 
    harassment — unwelcome sexual advances, requests for sexual favors, and other verbal or 
    physical conduct of a sexual nature.`,
    examples: ["Pregnancy-based termination", "Unequal pay for equal work", "Sexual harassment"],
    laws: ["Title VII Civil Rights Act (1964)", "Pregnancy Discrimination Act", "Title IX", "Durham City Code Chapter 18"],
  },
  {
    id: "national_origin",
    title: "National Origin",
    icon: "",
    summary: "Protection regardless of birthplace, ancestry, or language.",
    content: `National origin discrimination involves treating people unfavorably because they 
    are from a particular country or part of the world, because of ethnicity or accent, or 
    because they appear to be of a certain ethnic background. This includes discrimination 
    based on language — employers must show a legitimate business need for English-only rules.`,
    examples: ["Discrimination based on accent", "English-only rules without business justification", "Targeting a person based on perceived country of origin"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18", "Immigration Reform and Control Act"],
  },
  {
    id: "age",
    title: "Age (40+)",
    icon: "",
    summary: "Protects workers 40 and older from age-based discrimination.",
    content: `The Age Discrimination in Employment Act (ADEA) forbids age discrimination against 
    people who are 40 or older. It is not illegal for an employer to favor an older worker over 
    a younger one, even if both are 40 or older. Durham's code extends this protection locally.`,
    examples: ["Forced retirement", "Age-based layoff targeting", "Denial of training or promotion to older workers"],
    laws: ["Age Discrimination in Employment Act (ADEA)", "Durham City Code Chapter 18"],
  },
  {
    id: "disability",
    title: "Disability",
    icon: "",
    summary: "Requires reasonable accommodations and prohibits disability-based discrimination.",
    content: `The ADA prohibits discrimination against qualified individuals with disabilities in 
    all areas of public life. Employers must provide reasonable accommodations unless doing so 
    would cause undue hardship. A disability is a physical or mental condition that substantially 
    limits one or more major life activities.`,
    examples: ["Failure to provide wheelchair access", "Refusing reasonable accommodations", "Firing someone due to a medical condition"],
    laws: ["Americans with Disabilities Act (ADA)", "Rehabilitation Act", "Durham City Code Chapter 18"],
  },
  {
    id: "sexual_orientation",
    title: "Sexual Orientation",
    icon: "",
    summary: "Protection from discrimination based on sexual orientation.",
    content: `Durham explicitly protects residents from discrimination based on sexual orientation 
    in employment, housing, and public accommodations. Following the Supreme Court's 2020 ruling 
    in Bostock v. Clayton County, federal law also extends Title VII protections to sexual orientation.`,
    examples: ["Termination after disclosing sexual orientation", "Housing denial", "Hostile work environment"],
    laws: ["Durham City Code Chapter 18", "Title VII (Bostock v. Clayton County, 2020)"],
  },
  {
    id: "gender_identity",
    title: "Gender Identity or Expression",
    icon: "",
    summary: "Protection for transgender and gender non-conforming individuals.",
    content: `Durham prohibits discrimination based on gender identity or expression. This protects 
    transgender individuals, non-binary people, and anyone whose gender expression does not conform 
    to traditional expectations. The Bostock decision confirmed federal Title VII protection as well.`,
    examples: ["Misgendering an employee repeatedly", "Bathroom access denial", "Refusal to use preferred name"],
    laws: ["Durham City Code Chapter 18", "Title VII (Bostock v. Clayton County, 2020)"],
  },
  {
    id: "familial_status",
    title: "Familial Status",
    icon: "",
    summary: "Protects families with children under 18 from housing discrimination.",
    content: `Familial status discrimination in housing occurs when a landlord or housing provider 
    treats families with children under 18 differently than those without. This includes refusing 
    to rent, setting different terms, or steering families to certain units or neighborhoods.`,
    examples: ["Refusing to rent to a family with children", "Different lease terms for families", "Occupancy limits that exclude children"],
    laws: ["Fair Housing Act", "Durham City Code Chapter 18"],
  },
  {
    id: "veteran_status",
    title: "Veteran Status",
    icon: "",
    summary: "Protection for military veterans in employment and housing.",
    content: `Durham protects veterans from discrimination based on their military service status. 
    Additionally, the Uniformed Services Employment and Reemployment Rights Act (USERRA) ensures 
    that veterans can return to their jobs after service and are not discriminated against in hiring.`,
    examples: ["Refusal to hire due to military service", "Failure to reemploy a returning veteran", "Negative treatment based on deployment history"],
    laws: ["USERRA", "Durham City Code Chapter 18", "Vietnam Era Veterans Readjustment Assistance Act"],
  },
];

export default function EducatePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = PROTECTED_CLASSES.find(c => c.id === activeId);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "linear-gradient(135deg, #7B1C1C 0%, #5e1515 100%)",
          padding:    "4.5rem 1.5rem 3.5rem",
          textAlign:  "center",
        }}>
          <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.75rem" }}>Know your rights</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", marginBottom: "1rem" }}>
            Durham's 11 Protected Classes
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", maxWidth: "560px", margin: "0 auto", fontSize: "0.975rem", lineHeight: 1.7 }}>
            Under Durham City Code Chapter 18, these classes are protected from discrimination
            in employment, housing, and public accommodations. Click any card to learn more.
          </p>
        </section>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>

          {/* ── GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {PROTECTED_CLASSES.map(({ id, title, icon, summary }) => (
              <button
                key={id}
                onClick={() => setActiveId(activeId === id ? null : id)}
                style={{
                  background:    activeId === id ? "var(--color-primary)" : "var(--color-bg-card)",
                  border:        `1.5px solid ${activeId === id ? "var(--color-primary)" : "var(--color-border)"}`,
                  borderRadius:  "14px",
                  padding:       "1.25rem",
                  textAlign:     "left",
                  cursor:        "pointer",
                  transition:    "all 0.18s ease",
                  boxShadow:     "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
                <h3 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize:   "1rem",
                  color:      activeId === id ? "#fff" : "var(--color-text-primary)",
                  marginBottom: "0.35rem",
                }}>
                  {title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   "0.8rem",
                  color:      activeId === id ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}>
                  {summary}
                </p>
              </button>
            ))}
          </div>

          {/* ── EXPANDED DETAIL ── */}
          {active && (
            <div className="card" style={{ borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.75rem" }}>{active.icon}</span>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem" }}>{active.title}</h2>
              </div>

              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                {active.content}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.6rem" }}>
                    Examples
                  </h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {active.examples.map(ex => (
                      <li key={ex} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                        <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>•</span> {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.6rem" }}>
                    Applicable Laws
                  </h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {active.laws.map(law => (
                      <li key={law} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                        <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>•</span> {law}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── RESOURCE LINKS ── */}
          <div className="card" style={{ background: "var(--color-primary-light)", border: "1px solid #dbe8f8" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "1rem" }}>Durham Resources</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {[
                { label: "Durham Human Relations Commission", value: "" },
                { label: "NC Human Relations ",    value: "(919) 431-3000" },
                { label: "Durham City Hall",                value: "101 City Hall Plaza, Durham NC 27701" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "0.875rem", background: "#fff", borderRadius: "10px", border: "1px solid #dbe8f8" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.825rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer style={{ background: "#7B1C1C", color: "rgba(255,255,255,0.7)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
            SpeakEqual · North Carolina Central University
          </p>
        </footer>
      </main>
    </>
  );
}