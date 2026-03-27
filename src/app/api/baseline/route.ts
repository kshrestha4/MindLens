import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { sleepHours, sleepQuality, stressLevel, moodBaseline, energyLevel, phq9Score, gad7Score, wellbeingScore, notes } = body;

    const baseline = await prisma.baselineAssessment.upsert({
      where: { userId },
      update: {
        sleepHours: sleepHours ?? null,
        sleepQuality: sleepQuality ?? null,
        stressLevel: stressLevel ?? null,
        moodBaseline: moodBaseline ?? null,
        energyLevel: energyLevel ?? null,
        phq9Score: phq9Score ?? null,
        gad7Score: gad7Score ?? null,
        wellbeingScore: wellbeingScore ?? null,
        notes: notes ?? null,
      },
      create: {
        userId,
        sleepHours: sleepHours ?? null,
        sleepQuality: sleepQuality ?? null,
        stressLevel: stressLevel ?? null,
        moodBaseline: moodBaseline ?? null,
        energyLevel: energyLevel ?? null,
        phq9Score: phq9Score ?? null,
        gad7Score: gad7Score ?? null,
        wellbeingScore: wellbeingScore ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ baseline }, { status: 201 });
  } catch (err) {
    console.error("Baseline error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const baseline = await prisma.baselineAssessment.findUnique({ where: { userId } });
  return NextResponse.json({ baseline });
}
