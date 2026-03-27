import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeText } from "@/lib/nlp";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { analysis: true },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const { title, content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: { userId, title: title ?? null, content: content.trim() },
    });

    // Analyze if user has consent
    const consent = await prisma.consentSettings.findUnique({ where: { userId } });
    if (consent?.journalingAnalysis) {
      const analysis = analyzeText(content);
      await prisma.journalAnalysis.create({
        data: {
          journalEntryId: entry.id,
          sentimentScore: analysis.sentimentScore,
          negativityScore: analysis.negativityScore,
          emotion: analysis.emotion,
          keywords: analysis.keywords,
        },
      });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("Journal error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
