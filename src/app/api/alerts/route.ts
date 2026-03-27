import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ alerts });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const { ids, isRead } = await req.json();

    if (!Array.isArray(ids) || typeof isRead !== "boolean") {
      return NextResponse.json({ error: "ids (array) and isRead (boolean) are required." }, { status: 400 });
    }

    await prisma.alert.updateMany({
      where: { id: { in: ids }, userId },
      data: { isRead },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alert error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
