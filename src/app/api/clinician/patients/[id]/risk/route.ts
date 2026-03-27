import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clinicianId = (session.user as { id: string; role?: string }).id;
  const role = (session.user as { id: string; role?: string }).role;

  if (role !== "CLINICIAN" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id: patientId } = await params;

  // Verify link
  const link = await prisma.clinicianLink.findFirst({
    where: { clinicianId, patientId, status: "ACTIVE" },
  });
  if (!link) return NextResponse.json({ error: "Patient not linked." }, { status: 404 });

  // Check consent
  const consent = await prisma.consentSettings.findUnique({ where: { userId: patientId } });
  if (!consent?.clinicianSharing) {
    return NextResponse.json({ error: "Patient has not enabled data sharing." }, { status: 403 });
  }

  const riskScores = await prisma.riskScore.findMany({
    where: { userId: patientId },
    orderBy: { computedAt: "desc" },
    take: 5,
    include: { explanations: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: clinicianId,
      targetId: patientId,
      action: "VIEW_RISK_SCORE",
      resource: "RiskScore",
    },
  });

  return NextResponse.json({ riskScores });
}
