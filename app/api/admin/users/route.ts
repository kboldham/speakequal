import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

// GET: list all users with report and appointment counts
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      email:     true,
      role:      true,
      createdAt: true,
      _count: {
        select: { reports: true, appointments: true },
      },
    },
  });

  return NextResponse.json(users);
}

// DELETE: remove a user and clean up related data
export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Prevent self-deletion
  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  // Nullify userId on reports and appointments (preserve the records)
  await prisma.report.updateMany({ where: { userId }, data: { userId: null } });
  await prisma.appointment.updateMany({ where: { userId }, data: { userId: null } });

  // Delete conversations (non-nullable userId — must remove before user)
  const convos = await prisma.conversation.findMany({
    where:  { userId },
    select: { id: true },
  });
  const convoIds = convos.map(c => c.id);

  if (convoIds.length > 0) {
    await prisma.message.deleteMany({ where: { conversationId: { in: convoIds } } });
    await prisma.report.updateMany({
      where: { conversationId: { in: convoIds } },
      data:  { conversationId: null },
    });
    await prisma.conversation.deleteMany({ where: { userId } });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}

// PATCH: change role or trigger password reset
export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, action, role } = await req.json();
  if (!userId || !action) return NextResponse.json({ error: "userId and action required" }, { status: 400 });

  if (action === "setRole") {
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }
    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Role must be user or admin." }, { status: 400 });
    }
    await prisma.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ success: true });
  }

  if (action === "resetPassword") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed   = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry   = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data:  { resetToken: hashed, resetTokenExpiry: expiry },
    });

    await sendPasswordResetEmail(user.email, rawToken);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
