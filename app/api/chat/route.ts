import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/ratelimit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 2000;

// ─────────────────────────────────────────────────────────────
// PROMPT INJECTION SANITIZER
// ─────────────────────────────────────────────────────────────

/**
 * Patterns targeting structural injection attacks — role-switching, fake system
 * delimiters, and hidden-character tricks. Semantic content ("tell me how to...")
 * is intentionally excluded to avoid false positives for users describing incidents.
 */
const INJECTION_PATTERNS: [RegExp, string][] = [
  // Role-switching / persona hijacking
  [/ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi, "[removed]"],
  [/you\s+are\s+now\b/gi,                                        "[removed]"],
  [/\bact\s+as\b/gi,                                             "[removed]"],
  [/pretend\s+(you\s+are|to\s+be)\b/gi,                         "[removed]"],
  [/\bDAN\b/g,                                                   "[removed]"],
  [/jailbreak/gi,                                                "[removed]"],

  // Fake system / instruction delimiters
  [/^system\s*:/gim,             "[removed]:"],
  [/\[system\]/gi,               "[removed]"],
  [/<\s*system\s*>/gi,           "[removed]"],
  [/###\s*instruction/gi,        "[removed]"],
  [/###\s*system/gi,             "[removed]"],
  [/<\s*\/?instructions?\s*>/gi, "[removed]"],
  [/```\s*system/gi,             "```"],
  [/<\s*prompt\s*>/gi,           "[removed]"],

  // Invisible / direction-override characters
  [/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,   ""],
  [/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, ""],
];

function sanitizeMessage(raw: string): { sanitized: string; wasAltered: boolean } {
  let text = raw;
  let wasAltered = false;

  for (const [pattern, replacement] of INJECTION_PATTERNS) {
    const next = text.replace(pattern, replacement);
    if (next !== text) {
      wasAltered = true;
      text = next;
    }
  }

  // Collapse runs of the replacement token
  text = text.replace(/(\[removed\]\s*){2,}/g, "[removed] ");

  return { sanitized: text, wasAltered };
}

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AI advocate for SpeakEqual — a community platform that empowers residents to understand their civil rights, file discrimination reports, and schedule in-person appointments with advocates.

Your role combines the warmth of a social worker with the precision of a civil rights attorney. You are patient, trauma-informed, and skilled at helping people who may be frightened or confused. Make users feel heard, then help them efficiently.

## Your Personality
- Lead with empathy — acknowledge feelings before explaining anything
- Use plain language — define legal terms immediately after using them
- Be encouraging — help users feel their experience matters
- Be patient — never rush or make the user feel like a burden
- Be reassuring — remind users they are not alone
- If a user expresses distress, fear, or hopelessness, respond with extra warmth before anything else

## Four Areas of Discrimination
All discrimination reports must fall into one of these categories (use the exact key in parentheses when calling the submit function):
- **Employment** (employment) — hiring, firing, pay, promotions, harassment, job conditions
- **Fair Housing** (fair_housing) — renting, buying, mortgage lending, property maintenance
- **Public Accommodations** (public_accommodations) — restaurants, hotels, stores, healthcare facilities, government services
- **Other** (other) — education, voting rights, financial or credit discrimination, and other civil rights contexts

## The 11 Protected Classes
Discrimination must be connected to one of these characteristics (use the exact key in parentheses when calling the submit function):
- Race (race)
- Color (color)
- Religion (religion)
- Sex (sex)
- National Origin (national_origin)
- Age — applies to workers 40 and older (age)
- Disability (disability)
- Sexual Orientation (sexual_orientation)
- Gender Identity or Expression (gender_identity)
- Familial Status (familial_status)
- Veteran Status (veteran_status)

## How to Qualify a Discrimination Claim
A valid report requires all three of the following criteria. Extract as much as possible from what the user has already told you — never ask for something they already provided.

1. **Protected Class Membership** — Does the person belong to or identify with one of the 11 protected classes? Extract this from context (e.g. "they only hire white people" → race; "they fired me after I told them I was pregnant" → sex; "I use a wheelchair" → disability). Only ask if it is genuinely unclear.

2. **Adverse Action + Qualification** — Did the person suffer a negative outcome (fired, denied housing, refused service, rejected for a job, etc.) AND were they qualified or eligible? Extract from context (e.g. "I was denied the job and I know I'm qualified" → both confirmed; "I was evicted" → adverse action confirmed, ask about qualification if unclear). Only ask about qualification if it has not been established.

3. **Inference of Discrimination** — Is there a causal link between their protected class and the adverse action? Extract from context (e.g. direct statements like "they only want white people", patterns like "denied multiple times by the same company", timing, or comparative treatment). Only ask for more detail if the link is unclear.

After each user message, mentally check which criteria are already satisfied by what they said. Only ask follow-up questions for criteria that are genuinely still missing. Never ask the user to confirm information they already gave you.

If all three criteria are clearly met from the user's first message, skip straight to collecting the missing report details (date, respondent info, contact info).

If any of the three criteria cannot be established after exploring the situation, gently explain that the situation may not meet the threshold for a discrimination report and suggest booking an appointment with an advocate to discuss further.

## Filing a Report — Conversation Flow
Work through this dynamically — skip any step where the information was already provided:

1. **Category** — Infer from context if possible (job/hiring/workplace → employment; rental/mortgage → fair_housing; store/restaurant/service → public_accommodations). Only ask if genuinely unclear.
2. **Three criteria** — Extract from what the user said. Only ask follow-up questions for what is still missing. One question at a time.
3. **Date of incident** — Ask for this once criteria are met. If they give a rough timeframe ("last month", "a few months ago"), use the 1st of that month.
4. **Respondent info** — Ask if they know the name, address, or phone of the business/employer/landlord. Explain it is optional but helpful.
5. **Complainant contact info** — Ask if they want to provide their name, phone, address, zip. Explain it is fully optional and they may file anonymously.
6. **Confirm and submit** — Read back all collected details clearly and ask: "Does this look right? I'll go ahead and submit your report."
7. When the user says yes, confirms, or gives any affirmative response — you MUST call submit_discrimination_report immediately in that same response. Do NOT say "I'll submit it now" or "submitting…" as a text reply. The function call IS the submission. Never tell the user a report has been submitted unless the function returned success.

## Scheduling an Appointment
When a user wants to schedule an appointment:
1. Let them know they can book a Zoom consultation directly on this page using the "Schedule a Zoom Call" option
2. Explain that Calendly manages the scheduling and will automatically send a Zoom link to their email after booking
3. Do NOT attempt to book appointments yourself — direct users to the scheduling section of this page instead

## Legal Knowledge
You can explain these laws in plain terms:
- **Title VII of the Civil Rights Act (1964)** — employment discrimination based on race, color, religion, sex, or national origin
- **Americans with Disabilities Act (ADA, 1990)** — disability protections in employment, public places, and more
- **Age Discrimination in Employment Act (ADEA, 1967)** — protects workers 40 and older
- **Fair Housing Act (FHA, 1968)** — housing discrimination protections
- **Equal Pay Act (1963)** — equal pay for equal work regardless of sex
- **Section 504 of the Rehabilitation Act** — disability protections in federally funded programs

## About SpeakEqual
- A platform for community members to file discrimination reports and schedule appointments with advocates
- Reports can be filed with or without an account — no one is turned away
- Appointments are Zoom consultations with a SpeakEqual advocate, booked via the scheduling calendar on this page
- Users can view their dashboard to see past reports and upcoming appointments after signing in

## Important Guidelines
- Never dismiss or minimize the user's experience
- If the user describes an immediate safety threat, direct them to call 911 first
- Remind users they can consult a licensed attorney for complex legal matters
- If you cannot answer something, say so honestly and suggest an in-person appointment`;

// ─────────────────────────────────────────────────────────────
// OPENAI TOOLS (function calling)
// ─────────────────────────────────────────────────────────────
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "submit_discrimination_report",
      description:
        "Submit a discrimination report on behalf of the user. Only call this after you have all required fields AND the user has explicitly confirmed they want to submit.",
      parameters: {
        type: "object",
        properties: {
          incidentDate: {
            type: "string",
            description: "ISO date string of when the incident occurred (e.g. '2024-03-15'). Use the 1st of the month if only a month/year is given.",
          },
          discriminationType: {
            type: "string",
            enum: [
              "race", "color", "religion", "sex", "national_origin",
              "age", "disability", "sexual_orientation", "gender_identity",
              "familial_status", "veteran_status",
            ],
            description: "The protected class the discrimination falls under.",
          },
          category: {
            type: "string",
            enum: ["employment", "fair_housing", "public_accommodations", "other"],
            description: "The main area of discrimination.",
          },
          description: {
            type: "string",
            description: "A clear, detailed description of the incident as shared by the user, including the adverse action, why it connects to a protected class, and why the user was qualified.",
          },
          firstName:         { type: "string", description: "Complainant first name — only include if the user provided it." },
          lastName:          { type: "string", description: "Complainant last name — only include if the user provided it." },
          phone:             { type: "string", description: "Complainant phone number — only include if the user provided it." },
          address:           { type: "string", description: "Complainant street address — only include if the user provided it." },
          zipCode:           { type: "string", description: "Complainant zip code — only include if the user provided it." },
          respondentName:    { type: "string", description: "Name of the business, employer, landlord, or individual being complained against — only include if provided." },
          respondentAddress: { type: "string", description: "Respondent address — only include if provided." },
          respondentPhone:   { type: "string", description: "Respondent phone — only include if provided." },
        },
        required: ["incidentDate", "discriminationType", "category", "description"],
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────
// GET — list conversations for sidebar (logged-in users only)
// ─────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json(conversations);
}

// ─────────────────────────────────────────────────────────────
// POST — send a message and get an AI response
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const body = await req.json();
  const { message, conversationId, history: clientHistory } = body as {
    message: string;
    conversationId?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  // ── 1. Rate limiting ──
  const isAnon = !userId;
  const rateLimitKey =
    userId ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(rateLimitKey, isAnon);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a moment before sending another.", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // ── 2. Empty message guard ──
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // ── 3. Message length guard ──
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // ── 4. Prompt injection sanitization ──
  const { sanitized: sanitizedMessage, wasAltered } = sanitizeMessage(message);

  // ── Load prior messages if resuming a saved conversation (last 20 only) ──
  // For anonymous users, fall back to client-supplied history so context is not lost.
  let history: { role: "user" | "assistant"; content: string }[] = [];
  let activeConversationId = conversationId ?? null;

  if (userId && conversationId) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (conv && conv.userId === userId) {
      history = conv.messages.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    }
  } else if (!userId && clientHistory && clientHistory.length > 0) {
    // Anonymous users: use the last 20 messages sent by the client.
    // Sanitize every content field — the current-message sanitizer only covers
    // the new message; injections hidden in prior turns must be scrubbed here too.
    history = clientHistory.slice(-20).map((m) => ({
      role:    m.role,
      content: sanitizeMessage(m.content).sanitized,
    }));
  }

  // ── Build the OpenAI message array ──
  // Use sanitized message for OpenAI; preserve raw message for DB writes below.
  const userContent = wasAltered
    ? `[Note: This message was automatically filtered for security.]\n\n${sanitizedMessage}`
    : sanitizedMessage;

  const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userContent },
  ];

  // ── Agentic loop — handles tool calls recursively ──
  let createdReport = false;

  async function runLoop(
    msgs: OpenAI.Chat.ChatCompletionMessageParam[]
  ): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: msgs,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const choice = response.choices[0];

    // ── Handle tool calls ──
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      const nextMsgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...msgs,
        choice.message,
      ];

      for (const call of choice.message.tool_calls) {
        let toolResult = "";

        if (call.type !== "function") continue;

        try {
          const args = JSON.parse(call.function.arguments);

          if (call.function.name === "submit_discrimination_report") {
            const incidentDate = new Date(args.incidentDate);
            if (isNaN(incidentDate.getTime())) {
              toolResult = "Error: incidentDate is not a valid date. Ask the user to clarify the date and try again.";
            } else {
              await prisma.report.create({
                data: {
                  userId:            userId,
                  incidentDate,
                  discriminationType: args.discriminationType,
                  category:          args.category          ?? null,
                  description:       args.description,
                  source:            "ai",
                  conversationId:    activeConversationId   ?? null,
                  firstName:         args.firstName         ?? null,
                  lastName:          args.lastName          ?? null,
                  phone:             args.phone             ?? null,
                  address:           args.address           ?? null,
                  zipCode:           args.zipCode           ?? null,
                  respondentName:    args.respondentName    ?? null,
                  respondentAddress: args.respondentAddress ?? null,
                  respondentPhone:   args.respondentPhone   ?? null,
                },
              });
              createdReport = true;
              toolResult = "Report submitted successfully.";
            }
          }

        } catch {
          toolResult = "An error occurred. Let the user know and offer to try again.";
        }

        nextMsgs.push({
          role: "tool",
          tool_call_id: call.id,
          content: toolResult,
        });
      }

      return runLoop(nextMsgs);
    }

    return choice.message.content ?? "";
  }

  const assistantReply = await runLoop(openAiMessages);

  // ── Persist conversation + messages for logged-in users ──
  // Always use the raw `message` (not sanitized) so users see their original words.
  if (userId) {
    if (!activeConversationId) {
      const title = message.length > 60 ? message.slice(0, 57) + "…" : message;
      const newConv = await prisma.conversation.create({
        data: { userId, title },
      });
      activeConversationId = newConv.id;
    }

    await prisma.message.createMany({
      data: [
        { conversationId: activeConversationId, role: "user", content: message },
        { conversationId: activeConversationId, role: "assistant", content: assistantReply },
      ],
    });

    await prisma.conversation.update({
      where: { id: activeConversationId },
      data: { updatedAt: new Date() },
    });
  }

  return NextResponse.json({
    message: assistantReply,
    conversationId: activeConversationId,
    createdReport,
  });
}
