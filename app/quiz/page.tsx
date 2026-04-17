"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";

type Question = {
  id: string;
  type: "scenario" | "truefalse";
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  learnMoreHref: string;
  learnMoreLabel: string;
};

const QUESTION_BANK: Question[] = [
  {
    id: "q1",
    type: "scenario",
    text: "A landlord tells a family they cannot rent an apartment because they have young children.",
    options: [
      "Yes, this is Familial Status discrimination",
      "Yes, this is Race discrimination",
      "No, landlords can choose their tenants freely",
      "I am not sure",
    ],
    correctIndex: 0,
    explanation: "The Fair Housing Act prohibits landlords from refusing to rent to families with children under 18. This is called Familial Status discrimination and is illegal in Durham and under federal law.",
    learnMoreHref: "/learnmore#familial_status",
    learnMoreLabel: "Familial Status",
  },
  {
    id: "q2",
    type: "truefalse",
    text: "Employers can legally refuse to hire someone over age 60 for any job they consider physically demanding.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "False. The Age Discrimination in Employment Act requires employers to evaluate individuals on their actual abilities, not age assumptions. Blanket age-based exclusions for workers 40 and older are illegal.",
    learnMoreHref: "/learnmore#age",
    learnMoreLabel: "Age (40+)",
  },
  {
    id: "q3",
    type: "scenario",
    text: "An employee tells their manager they have anxiety and asks for a quieter workspace. The manager refuses without any discussion.",
    options: [
      "Possibly discrimination. Employers must explore reasonable accommodations.",
      "Not discrimination. Employers control workplace arrangements.",
      "Only discrimination if the disability is visible or physical",
      "Depends entirely on company size",
    ],
    correctIndex: 0,
    explanation: "Under the ADA and Durham City Code, employers must engage in an interactive process when an employee requests a reasonable accommodation for a disability. Refusing without discussion can constitute disability discrimination.",
    learnMoreHref: "/learnmore#disability",
    learnMoreLabel: "Disability",
  },
  {
    id: "q4",
    type: "truefalse",
    text: "An employer must grant any schedule change an employee requests for religious reasons.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "False. Employers must provide a reasonable accommodation for sincerely held religious beliefs, but only if it does not cause undue hardship to the business. The key word is reasonable. Not every request must be granted.",
    learnMoreHref: "/learnmore#religion",
    learnMoreLabel: "Religion",
  },
  {
    id: "q5",
    type: "scenario",
    text: "A manager passes over a highly qualified candidate for a promotion shortly after learning she is pregnant.",
    options: [
      "Discrimination: pregnancy is protected under Sex discrimination law",
      "Not discrimination. Promotion decisions are inherently subjective.",
      "Only discrimination if she can prove the manager knew she was pregnant",
      "Not covered by Durham's local ordinances",
    ],
    correctIndex: 0,
    explanation: "The Pregnancy Discrimination Act and Durham City Code Chapter 18 prohibit employers from making employment decisions based on pregnancy. Passing over a qualified employee because of pregnancy is textbook sex discrimination.",
    learnMoreHref: "/learnmore#sex",
    learnMoreLabel: "Sex",
  },
  {
    id: "q6",
    type: "truefalse",
    text: "Federal law protects employees from discrimination based on sexual orientation.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation: "True. In Bostock v. Clayton County (2020), the U.S. Supreme Court ruled that Title VII's prohibition on sex discrimination also covers sexual orientation and gender identity. Durham's City Code Chapter 18 provides additional local protection.",
    learnMoreHref: "/learnmore#sexual_orientation",
    learnMoreLabel: "Sexual Orientation",
  },
  {
    id: "q7",
    type: "scenario",
    text: "A customer notices a security guard follows them throughout a store. Other shoppers of different backgrounds are not followed.",
    options: [
      "May be racial discrimination in public accommodations",
      "Not discrimination. Security staff can monitor any customer.",
      "Only applies in employment contexts, not retail",
      "Depends entirely on the store's posted policies",
    ],
    correctIndex: 0,
    explanation: "Durham's public accommodations law prohibits race-based differential treatment in retail and service settings. Selective surveillance based on race can constitute discrimination even outside of employment.",
    learnMoreHref: "/learnmore#race",
    learnMoreLabel: "Race",
  },
  {
    id: "q8",
    type: "truefalse",
    text: "It is legal for an employer to require employees to speak English at all times in the workplace.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "False. Blanket English-only policies can violate Title VII's prohibition on national origin discrimination unless the employer can demonstrate a legitimate business necessity. Policies must be narrowly tailored, for example only during customer interactions.",
    learnMoreHref: "/learnmore#national_origin",
    learnMoreLabel: "National Origin",
  },
  {
    id: "q9",
    type: "scenario",
    text: "A veteran applies to rent an apartment. The landlord says: \"We do not rent to military people. They are too much trouble.\"",
    options: [
      "Discrimination: Veteran Status is a protected class in Durham",
      "Not discrimination. Private landlords can set their own tenant criteria.",
      "Only applies to employment, not housing",
      "Only illegal if the veteran is currently active duty",
    ],
    correctIndex: 0,
    explanation: "Durham City Code Chapter 18 explicitly includes veteran status as a protected class in housing. A landlord who refuses to rent based on a person's military service is violating local anti-discrimination law.",
    learnMoreHref: "/learnmore#veteran_status",
    learnMoreLabel: "Veteran Status",
  },
  {
    id: "q10",
    type: "truefalse",
    text: "Transgender employees in Durham are legally protected from workplace discrimination.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation: "True. Durham City Code Chapter 18 explicitly protects gender identity and expression. Combined with the Supreme Court's Bostock decision (2020), which extended Title VII protections to transgender workers, transgender employees have both local and federal protection.",
    learnMoreHref: "/learnmore#gender_identity",
    learnMoreLabel: "Gender Identity",
  },
  {
    id: "q11",
    type: "scenario",
    text: "Two coworkers of the same race are treated differently at work. The employee with darker skin is consistently passed over for client-facing assignments.",
    options: [
      "Color discrimination: skin tone is protected separately from race",
      "Not discrimination. Both employees share the same race.",
      "Only race discrimination, not color discrimination",
      "Not protected unless discrimination is explicitly stated",
    ],
    correctIndex: 0,
    explanation: "Title VII and Durham's ordinance protect against discrimination based on color as a distinct category from race. Even among people of the same racial group, preferential treatment based on skin tone is illegal colorism.",
    learnMoreHref: "/learnmore#color",
    learnMoreLabel: "Color",
  },
  {
    id: "q12",
    type: "truefalse",
    text: "The Americans with Disabilities Act only protects people who use wheelchairs or have visible physical disabilities.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "False. The ADA covers a broad range of conditions including mental health disorders, chronic illnesses, learning disabilities, and conditions that are not externally visible. The key question is whether the condition substantially limits a major life activity.",
    learnMoreHref: "/learnmore#disability",
    learnMoreLabel: "Disability",
  },
  {
    id: "q13",
    type: "scenario",
    text: "A new hire wears a beard as part of their religious practice. The employer tells them to shave or be terminated.",
    options: [
      "Possible religious discrimination. The employer must explore an accommodation first.",
      "Not discrimination. Employers can enforce any grooming standard.",
      "Only applies to employees who belong to recognized major religions",
      "Depends on the type of job",
    ],
    correctIndex: 0,
    explanation: "Title VII requires employers to reasonably accommodate sincerely held religious beliefs and practices, including grooming, unless doing so creates an undue hardship. Terminating an employee without exploring alternatives is likely religious discrimination.",
    learnMoreHref: "/learnmore#religion",
    learnMoreLabel: "Religion",
  },
  {
    id: "q14",
    type: "truefalse",
    text: "A landlord can legally advertise an apartment as \"perfect for couples, no kids\" without violating fair housing law.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "False. The Fair Housing Act prohibits discriminatory advertising, including language that signals a preference against families with children. Even suggesting a property is unsuitable for families can violate the law.",
    learnMoreHref: "/learnmore#familial_status",
    learnMoreLabel: "Familial Status",
  },
];

const QUIZ_LENGTH = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getEncouragement(score: number, total: number): { headline: string; sub: string } {
  const pct = score / total;
  if (pct === 1)   return { headline: "Perfect score!", sub: "You are a civil rights champion. Help spread the word." };
  if (pct >= 0.6)  return { headline: "Solid knowledge!", sub: "You are on the right track. Review what you missed below." };
  return { headline: "Good start.", sub: "Everyone starts somewhere. The more you know, the more you can protect yourself and others." };
}

export default function QuizPage() {
  const [screen, setScreen]       = useState<"intro" | "quiz" | "results">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [answers, setAnswers]     = useState<number[]>([]);
  const [copied, setCopied]       = useState(false);

  const initQuiz = useCallback(() => {
    setQuestions(shuffle(QUESTION_BANK).slice(0, QUIZ_LENGTH));
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setCopied(false);
  }, []);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  function handleStart() { setScreen("quiz"); }

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setAnswers(prev => [...prev, idx]);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setScreen("results");
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function handleRetake() {
    initQuiz();
    setScreen("quiz");
  }

  async function handleCopy() {
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const text = `I scored ${score}/${QUIZ_LENGTH} on the SpeakEqual Building Awareness Quiz! Do you know your rights? Take the quiz and share it. The more people who know, the better. #KnowYourRights #SpeakEqual #Durham`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: do nothing
    }
  }

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const q = questions[current];

  // INTRO
  if (screen === "intro") return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
        <section style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", padding: "4rem 1.5rem 3rem" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
            <span className="section-label" style={{ color: "#FFFFFF", display: "block", marginBottom: "0.5rem" }}>Building Awareness</span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>
              Do You Know Your Rights?
            </h1>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.8)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
              Test your knowledge of discrimination law with real-world scenarios. No sign-in required. Just curious? Asking for a friend? This is for everyone.
            </p>
            <p style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", marginBottom: "2rem" }}>
              {QUIZ_LENGTH} questions · About 3 minutes · Share your results
            </p>
            <button onClick={handleStart} className="btn-primary" style={{ fontSize: "1rem", padding: "0.7rem 2rem" }}>
              Start the Quiz
            </button>
          </div>
        </section>

        <div style={{ maxWidth: "640px", margin: "3rem auto", padding: "0 1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "1rem", textAlign: "center" }}>
            What to Expect
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Real Scenarios", desc: "Questions are based on actual types of discrimination cases across employment, housing, and public accommodations." },
              { label: "Instant Explanations", desc: "After each answer you will see the law behind it and a link to learn more." },
              { label: "Shareable Results", desc: "Your results include a one-tap share option to spread awareness with your network." },
            ].map(({ label, desc }) => (
              <div key={label} className="card" style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );

  // QUIZ
  if (screen === "quiz" && q) {
    const progress = (current / questions.length) * 100;
    return (
      <>
        <Navbar />
        <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

            {/* Progress */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  Question {current + 1} of {questions.length}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                  {q.type === "truefalse" ? "True / False" : "Scenario"}
                </span>
              </div>
              <div style={{ background: "var(--color-border)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, background: "var(--color-primary)", height: "100%", borderRadius: "999px", transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Question card */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                {q.type === "truefalse" ? "True or False?" : "Is this discrimination?"}
              </p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1rem, 2.5vw, 1.2rem)", lineHeight: 1.55, color: "var(--color-text-primary)" }}>
                {q.text}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isSelected = idx === selected;
                let bg = "var(--color-bg-muted)";
                let border = "1.5px solid var(--color-border)";
                let color = "var(--color-text-primary)";

                if (revealed) {
                  if (isCorrect) {
                    bg = "#D1FAE5"; border = "1.5px solid #6EE7B7"; color = "#065F46";
                  } else if (isSelected && !isCorrect) {
                    bg = "#FEE2E2"; border = "1.5px solid #FCA5A5"; color = "#991B1B";
                  }
                } else if (isSelected) {
                  border = "1.5px solid var(--color-primary)";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={revealed}
                    style={{
                      background: bg, border, color,
                      borderRadius: "10px", padding: "0.875rem 1rem",
                      fontFamily: "var(--font-body)", fontSize: "0.9rem",
                      textAlign: "left", cursor: revealed ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{
                      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                      background: revealed && isCorrect ? "#6EE7B7" : revealed && isSelected ? "#FCA5A5" : "var(--color-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700,
                      color: revealed && (isCorrect || isSelected) ? "#fff" : "var(--color-text-muted)",
                    }}>
                      {revealed && isCorrect ? "+" : revealed && isSelected && !isCorrect ? "x" : String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {revealed && (
              <div style={{ background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                  Explanation
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                  {q.explanation}
                </p>
                <Link
                  href={q.learnMoreHref}
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: "0.5rem" }}
                >
                  Learn more about {q.learnMoreLabel}
                </Link>
              </div>
            )}

            {revealed && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleNext} className="btn-primary" style={{ fontSize: "0.9rem", padding: "0.55rem 1.5rem" }}>
                  {current + 1 >= questions.length ? "See Results" : "Next Question"}
                </button>
              </div>
            )}
          </div>

          <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
          </footer>
        </main>
      </>
    );
  }

  // RESULTS
  const { headline, sub } = getEncouragement(score, questions.length);
  const missed = questions.filter((q, i) => answers[i] !== q.correctIndex);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Score card */}
          <div style={{ background: "linear-gradient(135deg, #1E1A16 0%, #2C2118 100%)", borderRadius: "16px", padding: "2.5rem 2rem", textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              SpeakEqual · Building Awareness
            </p>
            <div style={{ fontSize: "clamp(3rem, 8vw, 4.5rem)", fontFamily: "var(--font-heading)", color: "#fff", fontWeight: 700, lineHeight: 1, marginBottom: "0.25rem" }}>
              {score}<span style={{ fontSize: "0.45em", color: "rgba(255,255,255,0.5)" }}>/{questions.length}</span>
            </div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#fff", margin: "0.5rem 0 0.25rem" }}>{headline}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{sub}</p>
          </div>

          {/* Share */}
          <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>Spread Awareness</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
              The more people who know their rights, the stronger the community. Share this with friends, family, or anyone who might need it.
            </p>
            <button
              onClick={handleCopy}
              className={copied ? "btn-outline" : "btn-primary"}
              style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem" }}
            >
              {copied ? "Copied to clipboard!" : "Copy and Share"}
            </button>
          </div>

          {/* Missed questions */}
          {missed.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                Review What You Missed
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {missed.map(q => (
                  <div key={q.id} className="card" style={{ borderLeft: "3px solid #FCA5A5" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.4rem", lineHeight: 1.5 }}>
                      {q.text}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                      <strong>Correct answer:</strong> {q.options[q.correctIndex]}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                      {q.explanation}
                    </p>
                    <Link
                      href={q.learnMoreHref}
                      style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                    >
                      Learn more about {q.learnMoreLabel}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All correct */}
          {missed.length === 0 && (
            <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>You aced it!</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                Explore the full guide to deepen your knowledge across all 11 protected classes in Durham.
              </p>
              <Link href="/learnmore" className="btn-outline" style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem" }}>
                Read the Full Guide
              </Link>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={handleRetake} className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.55rem 1.5rem" }}>
              Retake with New Questions
            </button>
            <Link href="/learnmore" className="btn-outline" style={{ fontSize: "0.875rem", padding: "0.55rem 1.5rem" }}>
              Explore Full Guide
            </Link>
          </div>
        </div>

        <footer style={{ background: "#1E1A16", color: "rgba(255,255,255,0.65)", padding: "2.5rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>SpeakEqual</p>
        </footer>
      </main>
    </>
  );
}
