import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId },
    include: { analysis: true },
  });

  if (!entry) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!entry) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
