import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReportConfirmationEmail } from "@/lib/email";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit confusable chars
  let code = "SE-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST: manual form submission (anonymous submissions are allowed)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const body = await req.json();
  const {
    incidentDate, discriminationType, description, attachments,
    category,
    firstName, lastName, phone, address, zipCode,
    respondentName, respondentAddress, respondentPhone,
  } = body;
  // attachments = [{ fileName, fileUrl, fileType }] — uploaded separately, URLs passed here

  if (!incidentDate || !discriminationType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const trackingCode = generateTrackingCode();

  const report = await prisma.report.create({
    data: {
      userId,
      source: "form",
      incidentDate: new Date(incidentDate),
      discriminationType,
      category:          category          ?? null,
      description,
      firstName:         firstName         ?? null,
      lastName:          lastName          ?? null,
      phone:             phone             ?? null,
      address:           address           ?? null,
      zipCode:           zipCode           ?? null,
      respondentName:    respondentName    ?? null,
      respondentAddress: respondentAddress ?? null,
      respondentPhone:   respondentPhone   ?? null,
      trackingCode,
      attachments: attachments?.length
        ? { create: attachments.map((a: { fileName: string; fileUrl: string; fileType: string }) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
          }))}
        : undefined,
    },
    include: { attachments: true },
  });

  // Send confirmation email if user is logged in
  const userEmail = session?.user?.email;
  if (userEmail) {
    sendReportConfirmationEmail(userEmail, trackingCode, discriminationType).catch(console.error);
  }

  return NextResponse.json({ ...report, trackingCode });
}

// GET: current user's own reports
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}