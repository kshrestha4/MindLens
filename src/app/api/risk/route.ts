import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const riskScores = await prisma.riskScore.findMany({
    where: { userId },
    orderBy: { computedAt: "desc" },
    take: 10,
    include: { explanations: true },
  });

  return NextResponse.json({ riskScores });
}
