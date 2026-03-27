import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { computeAndSaveRisk } from "@/lib/risk-engine";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const riskScore = await computeAndSaveRisk(userId);
    return NextResponse.json({ riskScore }, { status: 201 });
  } catch (err) {
    console.error("Risk computation error:", err);
    return NextResponse.json({ error: "Failed to compute risk score." }, { status: 500 });
  }
}
