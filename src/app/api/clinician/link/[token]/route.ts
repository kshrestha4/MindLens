import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ token: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { token } = await params;

  const link = await prisma.clinicianLink.findUnique({ where: { inviteToken: token } });

  if (!link) return NextResponse.json({ error: "Invalid or expired invite token." }, { status: 404 });
  if (link.patientId !== userId) {
    return NextResponse.json({ error: "This invite was not sent to you." }, { status: 403 });
  }
  if (link.status === "ACTIVE") {
    return NextResponse.json({ error: "This link is already active." }, { status: 409 });
  }

  const updated = await prisma.clinicianLink.update({
    where: { id: link.id },
    data: { status: "ACTIVE", linkedAt: new Date(), inviteToken: null },
  });

  return NextResponse.json({ link: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { token } = await params;

  const link = await prisma.clinicianLink.findUnique({ where: { inviteToken: token } });
  if (!link || link.patientId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.clinicianLink.update({
    where: { id: link.id },
    data: { status: "REVOKED" },
  });

  return NextResponse.json({ success: true });
}
