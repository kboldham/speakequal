import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: fetch notes for a report the user owns
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.findUnique({
    where:  { id: params.id },
    select: { userId: true },
  });

  if (!report || report.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const notes = await prisma.reportNote.findMany({
    where:   { reportId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(notes);
}

// POST: add a note to a report the user owns
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.findUnique({
    where:  { id: params.id },
    select: { userId: true },
  });

  if (!report || report.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Note content is required" }, { status: 400 });
  }

  const note = await prisma.reportNote.create({
    data: { reportId: params.id, content: content.trim() },
  });

  return NextResponse.json(note);
}
