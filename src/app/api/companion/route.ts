import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { selectInterventions } from "@/lib/companion";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const suggestions = await prisma.companionSuggestion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ suggestions });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    // Get latest check-in and risk for context
    const [latestCheckIn, latestRisk, latestJournalAnalysis] = await Promise.all([
      prisma.dailyCheckIn.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.riskScore.findFirst({ where: { userId }, orderBy: { computedAt: "desc" } }),
      prisma.journalAnalysis.findFirst({
        where: { journalEntry: { userId } },
        orderBy: { analyzedAt: "desc" },
      }),
    ]);

    const interventions = selectInterventions({
      moodScore: latestCheckIn?.mood,
      stressScore: latestCheckIn?.stress,
      sleepQualityScore: latestCheckIn?.sleepQuality,
      energyScore: latestCheckIn?.energy,
      depressionRisk: latestRisk?.depressionRisk,
      stressRisk: latestRisk?.stressRisk,
      primaryEmotion: latestJournalAnalysis?.emotion,
    }, 3);

    const created = await prisma.$transaction(
      interventions.map((i) =>
        prisma.companionSuggestion.create({
          data: {
            userId,
            interventionType: i.type,
            title: i.title,
            content: i.content,
          },
        })
      )
    );

    return NextResponse.json({ suggestions: created }, { status: 201 });
  } catch (err) {
    console.error("Companion error:", err);
    return NextResponse.json({ error: "Failed to generate suggestions." }, { status: 500 });
  }
}
