import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clinicianId = (session.user as { id: string; role?: string }).id;
  const role = (session.user as { id: string; role?: string }).role;

  if (role !== "CLINICIAN" && role !== "ADMIN") {
    return NextResponse.json({ error: "Only clinicians can send invites." }, { status: 403 });
  }

  try {
    let email: string | null = null;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
    } else if (contentType.includes("form")) {
      const formData = await req.formData();
      email = formData.get("email") as string;
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Check if clinician profile exists
    const clinicianProfile = await prisma.clinicianProfile.findUnique({ where: { userId: clinicianId } });
    if (!clinicianProfile) {
      return NextResponse.json({ error: "Clinician profile not found." }, { status: 404 });
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({ where: { email } });

    const inviteToken = crypto.randomBytes(32).toString("hex");
    // Invite tokens expire after 7 days
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (patient) {
      // Create or update link
      await prisma.clinicianLink.upsert({
        where: { clinicianId_patientId: { clinicianId, patientId: patient.id } },
        update: { status: "PENDING", inviteToken, inviteEmail: email, inviteExpiresAt },
        create: {
          clinicianId,
          patientId: patient.id,
          status: "PENDING",
          inviteToken,
          inviteEmail: email,
          inviteExpiresAt,
        },
      });

      // Create alert for patient
      await prisma.alert.create({
        data: {
          userId: patient.id,
          type: "CLINICIAN_REQUEST",
          severity: "LOW",
          title: "Clinician Link Request",
          message: `A clinician has requested to link with your account. Accept the invite at /api/clinician/link/${inviteToken}`,
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      inviteToken,
      message: patient
        ? "Invite sent to existing patient."
        : "Invite token created. Patient must register and accept the invite.",
    }, { status: 201 });
  } catch (err) {
    console.error("Invite error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
