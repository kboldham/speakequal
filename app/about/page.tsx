import Navbar from "../components/navbar";
import Image from "next/image";

const team = [
  { name: "Corey Little",      role: "Project Manager",                          image: "/images/corey.jpeg",   linkedin: "https://www.linkedin.com/in/corey-little-070688281/" },
  { name: "Savion Brown",      role: "Lead Product Tester & Quality Assurance",  image: "/images/savion.jpeg",  linkedin: "https://www.linkedin.com/in/savion-brown-7b6ba928b/" },
  { name: "Dha'Shawn Johnson", role: "Lead UX & Design",                         image: "/images/dj.jpeg",      linkedin: "https://www.linkedin.com/in/dha%E2%80%99shawn-johnson-938140251/" },
  { name: "Kyle Oldham",       role: "Lead Developer",                           image: "/images/kyle2.jpeg",    linkedin: "https://www.linkedin.com/in/kyle-oldham-922607266/" },
  { name: "Melanie Osley",     role: "Lead Researcher",                          image: "/images/melanie.png",  linkedin: "https://www.linkedin.com/in/melanie-osley-869b232a4/" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <section style={{
          background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)",
          padding:    "5rem 1.5rem 4rem",
          textAlign:  "center",
        }}>
          <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.75rem" }}>
            About SpeakEqual
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", marginBottom: "1rem" }}>
            Built by our Community, for our Community
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", maxWidth: "580px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.7 }}>
            SpeakEqual is an independent platform dedicated to empowering residents, facilitating in-person advocacy appointments, and making civil rights education accessible to everyone.
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
              SpeakEqual is bridging the gap between community members and the resources they need to assert their civil rights. We serve as a neutral, independent facilitator connecting residents with trained advocates through a secure and accessible platform.
            </p>
          </div>

          {/* ── ABOUT THE PROJECT ── */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>The Project</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "1rem" }}>
              SpeakEqual
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
              An integrated system that assists residents facing discrimination issues across the 11 protected classes in Durham, NC. Using new technologies, we have created a user-friendly platform that connects residents with trained advocates for in-person appointments, while also providing educational resources on civil rights and discrimination.
            </p>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
              The platform includes an AI-powered assistant trained on Durham's discrimination laws and
              protected classes, a traditional form-based reporting path, a built-in appointment scheduler,
              and an admin dashboard for SpeakEqual advocates to manage submissions and appointments.
            </p>
          </div>

            
          <div className="card" style={{ marginBottom: "2rem" }}>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>Mission & Vision</span>
        
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
              SpeakEqual exists to make civil rights protection accessible to every Durham resident. Too many people experience discrimination and have nowhere to turn, no clear understanding of their rights, and no straightforward way to be heard. SpeakEqual closes that gap by giving residents a free confidential platform to report discrimination, connect with an advocate, and learn what the law guarantees. Not only the oppurtunity to learn but the opportunity to advocate for themselves on their own time, in their own words, and in a way that works for them.
            </p>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
              We believe that equal protection under the law means nothing if the people it protects cannot access it. SpeakEqual is built on the conviction that technology can lower the barriers between residents and the rights they already have.
            </p>
          </div>

          {/* ── TEAM ── */}
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: "0.75rem" }}>The Team</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", marginBottom: "1.5rem" }}>
              Meet The Team
            </h2>
            {/* Row 1 — 3 members */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.25rem" }}>
              {team.slice(0, 3).map(({ name, role, image, linkedin }) => (
                <div key={name} className="card" style={{ textAlign: "center" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 1rem", position: "relative" }}>
                    <Image src={image} alt={name} fill style={{ objectFit: "cover" }} sizes="80px" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{name}</h3>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</span>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`} className="social-link social-link--linkedin">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2 — 2 members centered at the same card width */}
            <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem" }}>
              {team.slice(3).map(({ name, role, image, linkedin }) => (
                <div key={name} className="card" style={{ textAlign: "center", flex: "0 0 calc(33.333% - 0.834rem)" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 1rem", position: "relative" }}>
                    <Image src={image} alt={name} fill style={{ objectFit: "cover" }} sizes="80px" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{name}</h3>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</span>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name} LinkedIn`} className="social-link social-link--linkedin">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>
            SpeakEqual
          </p>
        </footer>
      </main>
    </>
  );
}
