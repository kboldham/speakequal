import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TYPE_LABELS: Record<string, string> = {
  race: "Race", color: "Color", religion: "Religion", sex: "Sex",
  national_origin: "National Origin", age: "Age (40+)", disability: "Disability",
  sexual_orientation: "Sexual Orientation", gender_identity: "Gender Identity",
  familial_status: "Familial Status", veteran_status: "Veteran Status",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "No tracking code provided" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where:  { trackingCode: code },
    select: { status: true, discriminationType: true, createdAt: true, updatedAt: true },
  });

  if (!report) {
    return NextResponse.json({ error: "No report found for that code" }, { status: 404 });
  }

  return NextResponse.json({
    status:             report.status,
    discriminationType: TYPE_LABELS[report.discriminationType] ?? report.discriminationType,
    submittedAt:        report.createdAt,
    lastUpdated:        report.updatedAt,
  });
}
