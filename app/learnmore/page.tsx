"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";

const SECTIONS = [
  { id: "employment",            label: "Employment"             },
  { id: "housing",               label: "Housing"                },
  { id: "public-accommodations", label: "Public Accommodations"  },
  { id: "protected-classes",     label: "Protected Classes"      },
];

const PROTECTED_CLASSES = [
  {
    id: "race",
    title: "Race",
    summary: "Protection from discrimination based on race or racial characteristics.",
    content: `Under Title VII of the Civil Rights Act of 1964 and Durham City Code Chapter 18, it is unlawful to discriminate against any person based on their race in employment, housing, and public accommodations. This includes decisions about hiring, firing, pay, job assignments, promotions, layoffs, training, or any other term or condition of employment.`,
    examples: ["Being passed over for promotion due to race", "Racially hostile work environment", "Denial of housing based on race"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18", "NC Equal Employment Practices Act"],
  },
  {
    id: "color",
    title: "Color",
    summary: "Protection from discrimination based on skin color, separate from race.",
    content: `Color discrimination involves treating someone unfavorably because of skin color complexion. This can occur between persons of the same race or ethnic group, not just between different groups. Durham prohibits this as a distinct protected class.`,
    examples: ["Different treatment based on skin tone within the same racial group", "Colorism in hiring decisions"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18"],
  },
  {
    id: "religion",
    title: "Religion",
    summary: "Protection of religious beliefs and practices, including reasonable accommodations.",
    content: `Religious discrimination involves treating a person unfavorably because of their religious beliefs. The law protects not only people who belong to traditional, organized religions, but also others who have sincerely held religious, ethical, or moral beliefs. Employers and housing providers must make reasonable accommodations for religious practices.`,
    examples: ["Refusing to accommodate prayer times", "Requiring removal of religious attire", "Harassment about religious practices"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18"],
  },
  {
    id: "sex",
    title: "Sex",
    summary: "Includes pregnancy discrimination and gender-based treatment.",
    content: `Sex discrimination includes unfavorable treatment because of a person's sex, including pregnancy, childbirth, and related medical conditions. It also covers sexual harassment — unwelcome sexual advances, requests for sexual favors, and other verbal or physical conduct of a sexual nature.`,
    examples: ["Pregnancy-based termination", "Unequal pay for equal work", "Sexual harassment"],
    laws: ["Title VII Civil Rights Act (1964)", "Pregnancy Discrimination Act", "Title IX", "Durham City Code Chapter 18"],
  },
  {
    id: "national_origin",
    title: "National Origin",
    summary: "Protection regardless of birthplace, ancestry, or language.",
    content: `National origin discrimination involves treating people unfavorably because they are from a particular country or part of the world, because of ethnicity or accent, or because they appear to be of a certain ethnic background. This includes discrimination based on language — employers must show a legitimate business need for English-only rules.`,
    examples: ["Discrimination based on accent", "English-only rules without business justification", "Targeting a person based on perceived country of origin"],
    laws: ["Title VII Civil Rights Act (1964)", "Durham City Code Chapter 18", "Immigration Reform and Control Act"],
  },
  {
    id: "age",
    title: "Age (40+)",
    summary: "Protects workers 40 and older from age-based discrimination.",
    content: `The Age Discrimination in Employment Act (ADEA) forbids age discrimination against people who are 40 or older. It is not illegal for an employer to favor an older worker over a younger one, even if both are 40 or older. Durham's code extends this protection locally.`,
    examples: ["Forced retirement", "Age-based layoff targeting", "Denial of training or promotion to older workers"],
    laws: ["Age Discrimination in Employment Act (ADEA)", "Durham City Code Chapter 18"],
  },
  {
    id: "disability",
    title: "Disability",
    summary: "Requires reasonable accommodations and prohibits disability-based discrimination.",
    content: `The ADA prohibits discrimination against qualified individuals with disabilities in all areas of public life. Employers must provide reasonable accommodations unless doing so would cause undue hardship. A disability is a physical or mental condition that substantially limits one or more major life activities.`,
    examples: ["Failure to provide wheelchair access", "Refusing reasonable accommodations", "Firing someone due to a medical condition"],
    laws: ["Americans with Disabilities Act (ADA)", "Rehabilitation Act", "Durham City Code Chapter 18"],
  },
  {
    id: "sexual_orientation",
    title: "Sexual Orientation",
    summary: "Protection from discrimination based on sexual orientation.",
    content: `Durham explicitly protects residents from discrimination based on sexual orientation in employment, housing, and public accommodations. Following the Supreme Court's 2020 ruling in Bostock v. Clayton County, federal law also extends Title VII protections to sexual orientation.`,
    examples: ["Termination after disclosing sexual orientation", "Housing denial", "Hostile work environment"],
    laws: ["Durham City Code Chapter 18", "Title VII (Bostock v. Clayton County, 2020)"],
  },
  {
    id: "gender_identity",
    title: "Gender Identity",
    summary: "Protection for transgender and gender non-conforming individuals.",
    content: `Durham prohibits discrimination based on gender identity or expression. This protects transgender individuals, non-binary people, and anyone whose gender expression does not conform to traditional expectations. The Bostock decision confirmed federal Title VII protection as well.`,
    examples: ["Misgendering an employee repeatedly", "Bathroom access denial", "Refusal to use preferred name"],
    laws: ["Durham City Code Chapter 18", "Title VII (Bostock v. Clayton County, 2020)"],
  },
  {
    id: "familial_status",
    title: "Familial Status",
    summary: "Protects families with children under 18 from housing discrimination.",
    content: `Familial status discrimination in housing occurs when a landlord or housing provider treats families with children under 18 differently than those without. This includes refusing to rent, setting different terms, or steering families to certain units or neighborhoods.`,
    examples: ["Refusing to rent to a family with children", "Different lease terms for families", "Occupancy limits that exclude children"],
    laws: ["Fair Housing Act", "Durham City Code Chapter 18"],
  },
  {
    id: "veteran_status",
    title: "Veteran Status",
    summary: "Protection for military veterans in employment and housing.",
    content: `Durham protects veterans from discrimination based on their military service status. Additionally, the Uniformed Services Employment and Reemployment Rights Act (USERRA) ensures that veterans can return to their jobs after service and are not discriminated against in hiring.`,
    examples: ["Refusal to hire due to military service", "Failure to reemploy a returning veteran", "Negative treatment based on deployment history"],
    laws: ["USERRA", "Durham City Code Chapter 18", "Vietnam Era Veterans Readjustment Assistance Act"],
  },
];

function SectionCard({ title, body, examples, laws }: {
  title: string;
  body: string;
  examples: string[];
  laws: string[];
}) {
  return (
    <div className="card" style={{ marginBottom: "1.25rem", borderLeft: "4px solid var(--color-primary)" }}>
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>{title}</h3>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1.25rem", fontSize: "0.925rem" }}>{body}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div>
          <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.5rem" }}>
            Examples
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {examples.map(ex => (
              <li key={ex} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", gap: "0.4rem" }}>
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>•</span>{ex}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.5rem" }}>
            Applicable Laws
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {laws.map(law => (
              <li key={law} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", gap: "0.4rem" }}>
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>•</span>{law}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EducatePage() {
  const [activeSection, setActiveSection] = useState("employment");
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Highlight the correct sub-nav item as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Scroll to section on hash load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          // Account for sticky navbar (64px) + sticky subnav (~49px)
          const offset = 120;
          const y = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 150);
        // If it's a protected class id, open that card
        if (PROTECTED_CLASSES.find(c => c.id === hash)) {
          setActiveClass(hash);
          setActiveSection("protected-classes");
        }
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* HERO */}
        <section style={{
          background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)",
          padding:    "4.5rem 1.5rem 3.5rem",
          textAlign:  "center",
        }}>
          <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.75rem" }}>Know Your Rights</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", marginBottom: "1rem" }}>
            Understanding Discrimination
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", maxWidth: "580px", margin: "0 auto", fontSize: "0.975rem", lineHeight: 1.7 }}>
            Discrimination is prohibited across three major areas of life: employment, housing, and public accommodations. The 11 protected classes below form the legal foundation for what qualifies as unlawful discrimination in each area.
          </p>
        </section>

        {/* STICKY SUB-NAV */}
        <div style={{
          position:     "sticky",
          top:          "64px",
          zIndex:       40,
          background:   "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
          overflowX:    "auto",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "0" }}>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                style={{
                  fontFamily:     "var(--font-body)",
                  fontSize:       "0.875rem",
                  fontWeight:     activeSection === s.id ? 600 : 400,
                  color:          activeSection === s.id ? "var(--color-primary)" : "var(--color-text-secondary)",
                  borderBottom:   `2px solid ${activeSection === s.id ? "var(--color-primary)" : "transparent"}`,
                  padding:        "1rem 1.25rem",
                  textDecoration: "none",
                  whiteSpace:     "nowrap",
                  transition:     "all 0.15s",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>

          {/* EMPLOYMENT */}
          <section id="employment" ref={el => { sectionRefs.current.employment = el; }} style={{ paddingTop: "3.5rem", scrollMarginTop: "120px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>Employment</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.75rem" }}>
                Employment Discrimination
              </h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "800px" }}>
                Employment discrimination occurs when an employer, staffing agency, or labor organization treats an employee or job applicant unfavorably because of a protected characteristic. These protections apply to every stage of employment from the initial application through termination, and cover organizations with 15 or more employees under federal law, with broader coverage under Durham City Code.
              </p>
            </div>

            <SectionCard
              title="Hiring and Recruitment"
              body="Employers may not make hiring decisions, set job requirements, or conduct interviews in a way that screens out applicants based on a protected class. This includes background check policies that have a disparate impact on protected groups without business justification."
              examples={[
                "Refusing to interview applicants with foreign-sounding names",
                "Posting job requirements that disproportionately exclude a protected group",
                "Asking prohibited questions about age, religion, or disability status in interviews",
              ]}
              laws={["Title VII Civil Rights Act (1964)", "ADA Title I", "ADEA", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Pay, Benefits and Promotions"
              body="Employees performing substantially equal work must receive equal pay and benefits regardless of their protected class. This includes base salary, overtime, bonuses, stock options, profit sharing, vacation, insurance, and other benefits."
              examples={[
                "Paying a woman less than a man for the same role",
                "Denying promotion to a qualified employee based on race",
                "Excluding employees with disabilities from bonus programs",
              ]}
              laws={["Equal Pay Act (1963)", "Title VII Civil Rights Act (1964)", "ADEA", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Harassment in the Workplace"
              body="Workplace harassment based on a protected class is a form of discrimination. It becomes unlawful when it is so frequent or severe that it creates a hostile work environment, or when it results in an adverse employment decision such as a demotion or termination."
              examples={[
                "Repeated offensive jokes targeting a protected characteristic",
                "Displaying discriminatory symbols or materials in the workplace",
                "A supervisor conditioning advancement on acceptance of unwanted conduct",
              ]}
              laws={["Title VII Civil Rights Act (1964)", "ADA", "ADEA", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Termination and Retaliation"
              body="Employers may not terminate, demote, or retaliate against an employee for filing a discrimination complaint, participating in an investigation, or opposing discriminatory practices. Retaliation is one of the most commonly reported forms of employment discrimination."
              examples={[
                "Firing an employee after they file an EEOC complaint",
                "Demoting a worker who reported harassment",
                "Creating a hostile environment for a witness in a discrimination case",
              ]}
              laws={["Title VII Civil Rights Act (1964)", "ADA", "ADEA", "NC Equal Employment Practices Act"]}
            />

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/report" className="btn-primary" style={{ marginRight: "0.75rem" }}>File an Employment Complaint</Link>
              <Link href="#protected-classes" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>View Protected Classes</Link>
            </div>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "4rem 0 0" }} />

          {/* HOUSING */}
          <section id="housing" ref={el => { sectionRefs.current.housing = el; }} style={{ paddingTop: "3.5rem", scrollMarginTop: "120px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>Housing</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.75rem" }}>
                Housing Discrimination
              </h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "800px" }}>
                Housing discrimination occurs when a person is treated unfavorably in renting, purchasing, financing, or other housing-related transactions because of a protected characteristic. The Fair Housing Act and Durham City Code Chapter 18 together cover the full range of protected classes and apply to most housing transactions in the city.
              </p>
            </div>

            <SectionCard
              title="Renting and Leasing"
              body="Landlords and property managers may not refuse to rent, set different terms, impose different conditions, or misrepresent the availability of a unit based on a protected characteristic. This applies to advertising, application screening, lease terms, and renewals."
              examples={[
                "Refusing to rent to a family with children under 18",
                "Charging higher deposits to applicants of a certain race",
                "Falsely claiming a unit is unavailable to a prospective tenant",
              ]}
              laws={["Fair Housing Act (1968)", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Buying and Selling"
              body="It is illegal to refuse to sell, set discriminatory conditions, or misrepresent the terms of a sale based on a protected characteristic. Sellers, real estate agents, and brokers are all subject to these prohibitions."
              examples={[
                "Steering a buyer toward or away from neighborhoods based on race",
                "Refusing to show certain properties to buyers of a particular religion",
                "Setting higher asking prices for protected class members",
              ]}
              laws={["Fair Housing Act (1968)", "NC Fair Housing Act", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Mortgage Lending and Financing"
              body="Lenders, mortgage brokers, and other financial institutions may not discriminate in the terms, conditions, or availability of financing for a home purchase or refinance. This includes redlining, requiring higher down payments, and offering less favorable interest rates."
              examples={[
                "Denying a mortgage application based on neighborhood racial composition",
                "Offering less favorable loan terms to applicants with disabilities",
                "Requiring a higher down payment from applicants of a certain national origin",
              ]}
              laws={["Fair Housing Act (1968)", "Equal Credit Opportunity Act", "Community Reinvestment Act"]}
            />

            <SectionCard
              title="Reasonable Accommodations and Modifications"
              body="People with disabilities have the right to request reasonable accommodations in rules or policies and reasonable modifications to the physical structure of their home. Landlords must permit these changes when requested by a tenant with a disability."
              examples={[
                "Refusing to allow a wheelchair ramp installation",
                "Denying an exception to a no-pets policy for a service animal",
                "Failing to provide accessible parking for a tenant with a disability",
              ]}
              laws={["Fair Housing Act (1988 Amendments)", "ADA Title II", "Durham City Code Chapter 18"]}
            />

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/report" className="btn-primary" style={{ marginRight: "0.75rem" }}>File a Housing Complaint</Link>
              <Link href="#protected-classes" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>View Protected Classes</Link>
            </div>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "4rem 0 0" }} />

          {/* PUBLIC ACCOMMODATIONS */}
          <section id="public-accommodations" ref={el => { sectionRefs.current["public-accommodations"] = el; }} style={{ paddingTop: "3.5rem", scrollMarginTop: "120px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>Public Accommodations</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.75rem" }}>
                Public Accommodations Discrimination
              </h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "800px" }}>
                Public accommodations are places and services that are open to or serve the general public. Under Durham City Code Chapter 18 and applicable federal law, businesses and organizations must provide equal access to all individuals regardless of their protected class. Durham's local protections extend beyond federal law to cover all 11 protected classes in these settings.
              </p>
            </div>

            <SectionCard
              title="Retail, Restaurants and Services"
              body="Any business that serves the general public is considered a public accommodation and may not refuse service, impose different terms, or treat customers unequally based on a protected characteristic. This includes restaurants, shops, banks, salons, and professional service providers."
              examples={[
                "Refusing service to a customer based on religion",
                "Seating customers of a protected class in less desirable areas",
                "Applying different pricing or terms based on national origin",
              ]}
              laws={["Civil Rights Act Title II (1964)", "Durham City Code Chapter 18", "ADA Title III"]}
            />

            <SectionCard
              title="Healthcare and Social Services"
              body="Hospitals, clinics, and social service organizations that receive federal funding are prohibited from discriminating on the basis of a protected class. This includes denying care, providing inferior treatment, or failing to provide appropriate accommodations."
              examples={[
                "Denying care to a patient because of their sexual orientation",
                "Failing to provide interpreter services to a patient with limited English",
                "Providing lower quality care based on a patient's race or ethnicity",
              ]}
              laws={["Section 1557 of the ACA", "Section 504 Rehabilitation Act", "ADA Title III", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Government Services and Facilities"
              body="Government agencies, public schools, parks, libraries, and other publicly funded facilities must be equally accessible and equally served regardless of a person's protected class. This covers both physical access and the quality of services provided."
              examples={[
                "Excluding a person with a disability from a public program",
                "Unequal enforcement of rules based on race at a public facility",
                "Denying access to government benefits based on national origin",
              ]}
              laws={["ADA Title II", "Section 504 Rehabilitation Act", "Civil Rights Act Title VI (1964)", "Durham City Code Chapter 18"]}
            />

            <SectionCard
              title="Transportation"
              body="Public transportation providers and transportation network companies must provide equal access to all passengers regardless of protected class. This includes physical accessibility for individuals with disabilities and non-discriminatory service policies."
              examples={[
                "Refusing to pick up passengers based on race",
                "Failing to provide accessible vehicles for individuals with disabilities",
                "Different routing or service quality based on neighborhood demographics",
              ]}
              laws={["ADA Title II and III", "Civil Rights Act Title VI (1964)", "Durham City Code Chapter 18"]}
            />

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/report" className="btn-primary" style={{ marginRight: "0.75rem" }}>File a Complaint</Link>
              <Link href="#protected-classes" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>View Protected Classes</Link>
            </div>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "4rem 0 0" }} />

          {/* PROTECTED CLASSES */}
          <section id="protected-classes" ref={el => { sectionRefs.current["protected-classes"] = el; }} style={{ paddingTop: "3.5rem", scrollMarginTop: "120px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>Protected Classes</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.75rem" }}>
                The 11 Protected Classes
              </h2>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "800px" }}>
                These 11 characteristics are legally protected under Durham City Code Chapter 18 across all three areas of discrimination: employment, housing, and public accommodations. Select any class to learn more about how it is protected and what the law says.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {PROTECTED_CLASSES.map(({ id, title, summary }) => (
                <button
                  key={id}
                  id={id}
                  onClick={() => setActiveClass(activeClass === id ? null : id)}
                  style={{
                    background:   activeClass === id ? "var(--color-primary)" : "var(--color-bg-card)",
                    border:       `1.5px solid ${activeClass === id ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "14px",
                    padding:      "1.25rem",
                    textAlign:    "left",
                    cursor:       "pointer",
                    transition:   "all 0.18s ease",
                  }}
                >
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: activeClass === id ? "#fff" : "var(--color-text-primary)", marginBottom: "0.35rem" }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: activeClass === id ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    {summary}
                  </p>
                </button>
              ))}
            </div>

            {activeClass && (() => {
              const cls = PROTECTED_CLASSES.find(c => c.id === activeClass);
              if (!cls) return null;
              return (
                <div className="card" style={{ borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>{cls.title}</h2>
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1.5rem", fontSize: "0.925rem" }}>
                    {cls.content}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.5rem" }}>Examples</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {cls.examples.map(ex => (
                          <li key={ex} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", gap: "0.4rem" }}>
                            <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>•</span>{ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)", marginBottom: "0.5rem" }}>Applicable Laws</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {cls.laws.map(law => (
                          <li key={law} style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", gap: "0.4rem" }}>
                            <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>•</span>{law}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="card" style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-border)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Need More Help?</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.6 }}>
                If you believe your rights have been violated, Speak Equal can connect you with a trained advocate for an in-person appointment.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/report" className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.45rem 1.1rem" }}>File a Report</Link>
                <Link href="/report" className="btn-outline" style={{ fontSize: "0.875rem", padding: "0.45rem 1.1rem" }}>Schedule an Appointment</Link>
              </div>
            </div>
          </section>

        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>
            Speak Equal
          </p>
        </footer>
      </main>
    </>
  );
}
