import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ checkIns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const { mood, stress, energy, sleepQuality, sleepHours, reflection } = await req.json();

    if ([mood, stress, energy, sleepQuality].some((v) => v == null || v < 1 || v > 10)) {
      return NextResponse.json({ error: "mood, stress, energy, sleepQuality must be 1–10." }, { status: 400 });
    }

    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId,
        mood: parseInt(mood),
        stress: parseInt(stress),
        energy: parseInt(energy),
        sleepQuality: parseInt(sleepQuality),
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        reflection: reflection ?? null,
      },
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
