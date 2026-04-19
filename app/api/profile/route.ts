import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: change email or change password
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ── Change email ────────────────────────────────────────────
  if (action === "email") {
    const { newEmail, currentPassword } = body;

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: "Email and current password required" }, { status: 400 });
    }

    const valid = await compare(currentPassword, user.hashedPassword);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    return NextResponse.json({ success: true });
  }

  // ── Change password ─────────────────────────────────────────
  if (action === "password") {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const valid = await compare(currentPassword, user.hashedPassword);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: hashed } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE: remove account (anonymize reports, free slots, delete user)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await compare(currentPassword, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
  }

  await prisma.$transaction([
    // Anonymize reports (preserve the report, just remove the user link)
    prisma.report.updateMany({ where: { userId: session.user.id }, data: { userId: null } }),
    // Delete appointments
    prisma.appointment.deleteMany({ where: { userId: session.user.id } }),
    // Delete conversations (messages cascade via DB relation)
    prisma.conversation.deleteMany({ where: { userId: session.user.id } }),
    // Delete user
    prisma.user.delete({ where: { id: session.user.id } }),
  ]);

  return NextResponse.json({ success: true });
}
