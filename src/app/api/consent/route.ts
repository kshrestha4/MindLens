import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const consent = await prisma.consentSettings.findUnique({ where: { userId } });
  return NextResponse.json({ consent });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const { journalingAnalysis, voiceUpload, voiceFeatureExtract, clinicianSharing, dataRetentionDays } = await req.json();

    const consent = await prisma.consentSettings.upsert({
      where: { userId },
      update: {
        ...(journalingAnalysis !== undefined && { journalingAnalysis }),
        ...(voiceUpload !== undefined && { voiceUpload }),
        ...(voiceFeatureExtract !== undefined && { voiceFeatureExtract }),
        ...(clinicianSharing !== undefined && { clinicianSharing }),
        ...(dataRetentionDays !== undefined && { dataRetentionDays }),
      },
      create: {
        userId,
        journalingAnalysis: journalingAnalysis ?? false,
        voiceUpload: voiceUpload ?? false,
        voiceFeatureExtract: voiceFeatureExtract ?? false,
        clinicianSharing: clinicianSharing ?? false,
        dataRetentionDays: dataRetentionDays ?? 365,
      },
    });

    return NextResponse.json({ consent });
  } catch (err) {
    console.error("Consent error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
