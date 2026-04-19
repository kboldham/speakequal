import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify Calendly webhook signature
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (signingKey) {
    const signature = req.headers.get("Calendly-Webhook-Signature") ?? "";
    const expected = crypto
      .createHmac("sha256", signingKey)
      .update(rawBody)
      .digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle new bookings
  if (body.event !== "invitee.created") {
    return NextResponse.json({ ok: true });
  }

  const payload = body.payload as Record<string, unknown>;
  const scheduledEvent = payload.scheduled_event as Record<string, unknown>;
  const location = scheduledEvent?.location as Record<string, unknown> | undefined;

  const email        = payload.email as string | undefined;
  const startTime    = scheduledEvent?.start_time as string | undefined;
  const zoomJoinUrl  = location?.join_url as string | undefined;
  const calendlyEventId = scheduledEvent?.uri as string | undefined;

  if (!email || !startTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up user by email (optional — anonymous bookings are allowed)
  const user = await prisma.user.findUnique({ where: { email } });

  await prisma.appointment.create({
    data: {
      userId:          user?.id ?? null,
      calendlyEventId: calendlyEventId ?? null,
      startTime:       new Date(startTime),
      zoomJoinUrl:     zoomJoinUrl ?? null,
      status:          "scheduled",
      source:          "calendly",
    },
  });

  await sendAppointmentConfirmationEmail(email, new Date(startTime), zoomJoinUrl ?? null);

  return NextResponse.json({ ok: true });
}
