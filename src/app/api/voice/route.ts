import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  // Check consent
  const consent = await prisma.consentSettings.findUnique({ where: { userId } });
  if (!consent?.voiceUpload) {
    return NextResponse.json(
      { error: "Voice upload is disabled. Enable it in Settings → Privacy." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    // In production, upload to S3/GCS. Here we store a placeholder key.
    const storageKey = `voice/${userId}/${Date.now()}-${audio.name}`;

    const voiceNote = await prisma.voiceNote.create({
      data: {
        userId,
        storageKey,
        duration: null,
        transcription: null,
      },
    });

    return NextResponse.json({ voiceNote }, { status: 201 });
  } catch (err) {
    console.error("Voice upload error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const voiceNotes = await prisma.voiceNote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { features: true },
  });

  return NextResponse.json({ voiceNotes });
}
