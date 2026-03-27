import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const suggestion = await prisma.companionSuggestion.findFirst({ where: { id, userId } });
  if (!suggestion) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let isHelpful: boolean | null = null;
  try {
    const body = await req.json();
    if (typeof body.isHelpful === "boolean") isHelpful = body.isHelpful;
  } catch {
    // body is optional
  }

  const updated = await prisma.companionSuggestion.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      ...(isHelpful !== null ? { isHelpful } : {}),
    },
  });

  return NextResponse.json({ suggestion: updated });
}
