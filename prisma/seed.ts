import { PrismaClient, Role, InterventionType, AlertType, AlertSeverity } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("Demo1234!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@mindlens.app" },
    update: {},
    create: {
      email: "demo@mindlens.app",
      name: "Alex Demo",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  // Create clinician
  const clinician = await prisma.user.upsert({
    where: { email: "clinician@mindlens.app" },
    update: {},
    create: {
      email: "clinician@mindlens.app",
      name: "Dr. Sarah Chen",
      password: hashedPassword,
      role: Role.CLINICIAN,
    },
  });

  // Clinician profile
  await prisma.clinicianProfile.upsert({
    where: { userId: clinician.id },
    update: {},
    create: {
      userId: clinician.id,
      licenseNumber: "PSY-12345",
      specialty: "Cognitive Behavioral Therapy",
      institution: "MindCare Clinic",
      verifiedAt: new Date(),
    },
  });

  // Consent settings for demo user
  await prisma.consentSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      journalingAnalysis: true,
      voiceUpload: false,
      voiceFeatureExtract: false,
      clinicianSharing: true,
      dataRetentionDays: 365,
    },
  });

  // Baseline assessment
  await prisma.baselineAssessment.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      sleepHours: 7.0,
      sleepQuality: 6,
      stressLevel: 5,
      moodBaseline: 6,
      energyLevel: 6,
      phq9Score: 8,
      gad7Score: 7,
      wellbeingScore: 15,
      notes: "Initial baseline assessment completed during onboarding.",
    },
  });

  // Daily check-ins for past 21 days
  const checkInData = [
    { mood: 7, stress: 4, energy: 7, sleepQuality: 7, sleepHours: 7.5, daysAgo: 21 },
    { mood: 6, stress: 5, energy: 6, sleepQuality: 6, sleepHours: 7.0, daysAgo: 20 },
    { mood: 6, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.5, daysAgo: 19 },
    { mood: 5, stress: 7, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 18 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 17 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 16 },
    { mood: 6, stress: 5, energy: 6, sleepQuality: 6, sleepHours: 7.0, daysAgo: 15 },
    { mood: 7, stress: 4, energy: 7, sleepQuality: 7, sleepHours: 7.5, daysAgo: 14 },
    { mood: 6, stress: 5, energy: 6, sleepQuality: 6, sleepHours: 7.0, daysAgo: 13 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 12 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 11 },
    { mood: 3, stress: 8, energy: 3, sleepQuality: 3, sleepHours: 5.0, daysAgo: 10 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 9 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 8 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 7 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 6 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 5 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 4 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 3 },
    { mood: 4, stress: 7, energy: 4, sleepQuality: 4, sleepHours: 5.5, daysAgo: 2 },
    { mood: 5, stress: 6, energy: 5, sleepQuality: 5, sleepHours: 6.0, daysAgo: 1 },
  ];

  for (const data of checkInData) {
    const date = new Date();
    date.setDate(date.getDate() - data.daysAgo);
    date.setHours(20, 0, 0, 0);
    await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        mood: data.mood,
        stress: data.stress,
        energy: data.energy,
        sleepQuality: data.sleepQuality,
        sleepHours: data.sleepHours,
        reflection: data.daysAgo % 3 === 0 ? "Feeling a bit overwhelmed with work lately." : null,
        createdAt: date,
      },
    });
  }

  // Journal entries
  const journalEntries = [
    {
      title: "Rough week at work",
      content:
        "I've been feeling really overwhelmed and anxious about the upcoming project deadline. Every time I think about it, my chest tightens and I can't focus. I'm worried I'm not good enough to handle this. Sleep has been terrible.",
      daysAgo: 7,
    },
    {
      title: "Small wins",
      content:
        "Today was actually okay. I finished a task I'd been procrastinating on and felt proud of myself. Had coffee with a friend which helped lift my mood. Still feeling some anxiety about the future, but today was manageable.",
      daysAgo: 4,
    },
    {
      title: "Weekend reflections",
      content:
        "Spent some time outdoors this weekend. The fresh air helped. I'm grateful for the quiet moments. Still feeling sad about some things but trying to practice gratitude. Hopeful that things will improve.",
      daysAgo: 2,
    },
  ];

  for (const entry of journalEntries) {
    const date = new Date();
    date.setDate(date.getDate() - entry.daysAgo);
    const je = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: entry.title,
        content: entry.content,
        createdAt: date,
      },
    });

    // Add analysis
    await prisma.journalAnalysis.create({
      data: {
        journalEntryId: je.id,
        sentimentScore: entry.daysAgo === 7 ? -0.6 : entry.daysAgo === 4 ? 0.2 : 0.35,
        emotion: entry.daysAgo === 7 ? "anxiety" : entry.daysAgo === 4 ? "hope" : "gratitude",
        negativityScore: entry.daysAgo === 7 ? 0.72 : entry.daysAgo === 4 ? 0.3 : 0.2,
        keywords:
          entry.daysAgo === 7
            ? ["overwhelmed", "anxious", "deadline", "worried", "sleep"]
            : entry.daysAgo === 4
            ? ["proud", "friend", "anxiety", "manageable"]
            : ["grateful", "hopeful", "outdoors", "improve"],
      },
    });
  }

  // Risk score
  const riskScore = await prisma.riskScore.create({
    data: {
      userId: user.id,
      depressionRisk: 52,
      stressRisk: 65,
      generalRisk: 58,
      computedAt: new Date(),
    },
  });

  await prisma.riskExplanationFactor.createMany({
    data: [
      {
        riskScoreId: riskScore.id,
        factor: "mood_trend",
        label: "Declining Mood",
        value: -0.35,
        weight: 0.4,
        description: "Your mood scores have declined by an average of 0.35 points/day over 14 days.",
      },
      {
        riskScoreId: riskScore.id,
        factor: "sleep_decline",
        label: "Reduced Sleep",
        value: -0.9,
        weight: 0.3,
        description: "Average sleep has dropped from 7.5 to 5.5 hours over the past two weeks.",
      },
      {
        riskScoreId: riskScore.id,
        factor: "stress_elevation",
        label: "Elevated Stress",
        value: 1.2,
        weight: 0.3,
        description: "Stress scores show a consistent upward trend over the past 10 days.",
      },
    ],
  });

  // Alert
  await prisma.alert.create({
    data: {
      userId: user.id,
      riskScoreId: riskScore.id,
      type: AlertType.RISK_THRESHOLD,
      severity: AlertSeverity.MEDIUM,
      title: "Elevated Stress Risk Detected",
      message:
        "Your recent check-ins indicate elevated stress levels. Consider trying one of the companion exercises to help manage stress.",
      isRead: false,
    },
  });

  // Companion suggestions
  await prisma.companionSuggestion.createMany({
    data: [
      {
        userId: user.id,
        interventionType: InterventionType.BREATHING,
        title: "4-7-8 Breathing Exercise",
        content:
          "Try this calming breath technique: Inhale quietly through your nose for 4 seconds. Hold your breath for 7 seconds. Exhale completely through your mouth for 8 seconds. Repeat 3-4 times. This activates your parasympathetic nervous system and reduces stress hormones.",
        isCompleted: true,
        isHelpful: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        interventionType: InterventionType.COGNITIVE_REFRAMING,
        title: "Challenge a Negative Thought",
        content:
          'When you notice a negative thought, try this CBT technique:\n1. Write down the thought (e.g., "I\'m not good enough")\n2. Ask: What evidence supports this? What contradicts it?\n3. Ask: What would I tell a friend thinking this?\n4. Create a balanced, realistic alternative thought\n\nThis builds cognitive flexibility and reduces rumination.',
        isCompleted: false,
      },
      {
        userId: user.id,
        interventionType: InterventionType.SLEEP_HYGIENE,
        title: "Wind-Down Routine",
        content:
          "Improve your sleep quality with a consistent wind-down routine:\n• Stop screens 1 hour before bed\n• Keep the room cool (65-68°F / 18-20°C)\n• Try 10 minutes of light stretching\n• Write down tomorrow's 3 priorities to clear your mind\n• Use white noise or gentle music if needed\n\nConsistency is key — try it for 7 days.",
        isCompleted: false,
      },
    ],
  });

  // Link clinician to patient
  await prisma.clinicianLink.upsert({
    where: { clinicianId_patientId: { clinicianId: clinician.id, patientId: user.id } },
    update: {},
    create: {
      clinicianId: clinician.id,
      patientId: user.id,
      status: "ACTIVE",
      linkedAt: new Date(),
    },
  });

  console.log("✅ Seed complete!");
  console.log("  Demo user:      demo@mindlens.app / Demo1234!");
  console.log("  Clinician:      clinician@mindlens.app / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
