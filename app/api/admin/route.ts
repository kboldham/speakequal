import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReportStatusEmail, sendAppointmentStatusEmail } from "@/lib/email";

function requireAdmin(role: string | undefined) {
  return role === "admin";
}

// GET: all reports + appointments for admin dashboard
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view"); // "reports" | "appointments"

  if (view === "reports") {
    const reports = await prisma.report.findMany({
      include: { user: { select: { email: true } }, attachments: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reports);
  }

  if (view === "appointments") {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: { select: { email: true } },
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(appointments);
  }

  return NextResponse.json({ error: "Specify ?view=reports or ?view=appointments" }, { status: 400 });
}

// PATCH: update report status or appointment status
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, id, status } = await req.json();
  // type: "report" | "appointment"

  if (type === "report") {
    const updated = await prisma.report.update({
      where:   { id },
      data:    { status },
      include: { user: { select: { email: true } } },
    });
    if (updated.user?.email) {
      sendReportStatusEmail(updated.user.email, id, status).catch(console.error);
    }
    return NextResponse.json(updated);
  }

  if (type === "appointment") {
    const updated = await prisma.appointment.update({
      where:   { id },
      data:    { status },
      include: { user: { select: { email: true } }, slot: true },
    });
    if (updated.user?.email) {
      sendAppointmentStatusEmail(updated.user.email, updated.slot.startTime, status).catch(console.error);
    }
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// POST: admin creates available time slots
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !requireAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slots } = await req.json();
  // slots = [{ startTime, endTime }]

  const created = await prisma.timeSlot.createMany({
    data: slots.map((s: { startTime: string; endTime: string }) => ({
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
    })),
  });

  return NextResponse.json(created);
}
