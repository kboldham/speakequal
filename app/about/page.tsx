import Navbar from "../components/navbar";

// ── Update these with your real team info ──
const team = [
  { name: "Corey Little", role: "Project Manager", bio: "Bio" },
  { name: "Savion Brown", role: "Developer", bio: "Bio" },
  { name: "Deshawn Johnson", role: "Developer", bio: "Bio" },
  { name: "Kyle Oldham", role: "Lead Developer",  bio: "Bio" },
  { name: "Melanie Osley", role: "Researcher",  bio: "Bio" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "linear-gradient(135deg, #7B1C1C 0%, #5e1515 100%)",
          padding:    "5rem 1.5rem 4rem",
          textAlign:  "center",
        }}>
          <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.75rem" }}>
            About Speak Equal
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", marginBottom: "1rem" }}>
            Built by our Community, for our Community
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", maxWidth: "580px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.7 }}>
            This platform was developed as a capstone project to modernize how Durham residents access
            discrimination reporting and Human Relations  services.
          </p>
        </section>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "4rem 1.5rem" }}>

          {/* ── ABOUT THE ORG ── */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>The Organization</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "1rem" }}>
              Durham Committee on the Affairs of Black People, Inc (DCABP, Inc.)
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
              Durham Committee on the Affairs of Black People Inc. (DCABP Inc.) is a 501(c)(3) nonprofit community-based organization established in 2014. DCABP Inc. has stood at the forefront to champion Social Justice and Racial Equity (SJ/RE) since its inception. DCABP Inc. initiatives prioritize focus areas in Civic, Economic, Health, Housing, and Youth/Education. They are supported by dedicated staff, college student interns, and volunteers such as ourselves.  
            </p>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
              Speak Equal is bridging the divide within our community between acess and 
            </p>
          </div>

          {/* ── ABOUT THE PROJECT ── */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>The Project</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "1rem" }}>
              Our Capstone
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
              NCCU students (CIS majors) will work on a two-semester Capstone project to develop a prototype App with AI integration that assists residents facing discrimination issues revolving around the 11 protected classes (e.g., housing, employment, public accommodations) in Durham, NC.
            </p>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
              The platform includes an AI-powered assistant trained on Durham's discrimination laws and
              protected classes, a traditional form-based reporting path, a built-in appointment scheduler,
              and an admin dashboard for the Human Relations  team to manage submissions.
            </p>
          </div>

          {/* ── TEAM ── */}
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>The Team</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "1.5rem" }}>
              Meet The Team
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
              {team.map(({ name, role, bio }) => (
                <div key={name} className="card" style={{ textAlign: "center" }}>
                  {/* Avatar placeholder */}
                  <div style={{
                    width:        "64px",
                    height:       "64px",
                    borderRadius: "50%",
                    background:   "var(--color-primary-light)",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    margin:       "0 auto 1rem",
                    fontSize:     "1.5rem",
                    fontWeight:   700,
                    color:        "var(--color-primary)",
                    fontFamily:   "var(--font-heading)",
                  }}>
                    {name.charAt(0)}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{name}</h3>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</span>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginTop: "0.75rem" }}>{bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#7B1C1C", color: "rgba(255,255,255,0.7)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
            SpeakEqual · North Carolina Central University
          </p>
        </footer>
      </main>
    </>
  );
}