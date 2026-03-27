import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string; role?: string }).id;
  const role = (session.user as { id: string; role?: string }).role;

  if (role !== "CLINICIAN" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const links = await prisma.clinicianLink.findMany({
    where: { clinicianId: userId, status: "ACTIVE" },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          riskScores: { orderBy: { computedAt: "desc" }, take: 1 },
          checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
          consentSettings: { select: { clinicianSharing: true } },
        },
      },
    },
  });

  return NextResponse.json({ patients: links.map((l) => l.patient) });
}
