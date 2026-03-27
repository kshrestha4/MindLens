import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export interface RiskResult {
  depressionRisk: number;
  stressRisk: number;
  generalRisk: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  label: string;
  value: number;
  weight: number;
  description: string;
}

// PHQ-9 scoring constants (max score = 27, scale to max adjustment of 35)
const PHQ9_MAX = 27;
const PHQ9_SCALE_FACTOR = 40;
const PHQ9_BASELINE_OFFSET = 5;

// GAD-7 scoring constants (max score = 21, scale to max adjustment of 30)
const GAD7_MAX = 21;
const GAD7_SCALE_FACTOR = 35;
const GAD7_BASELINE_OFFSET = 5;

/** Compute a linear regression slope for an array of values */
function computeSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Convert a slope (negative = worsening) to a risk contribution 0–100 */
function slopeToRisk(slope: number, sensitivityFactor = 20): number {
  // negative slope → increasing risk; positive → decreasing risk
  return clamp(50 - slope * sensitivityFactor);
}

export async function computeRiskForUser(userId: string): Promise<RiskResult> {
  const since = subDays(new Date(), 21);

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });

  const baseline = await prisma.baselineAssessment.findUnique({
    where: { userId },
  });

  const recentAnalyses = await prisma.journalAnalysis.findMany({
    where: { journalEntry: { userId, createdAt: { gte: since } } },
    orderBy: { analyzedAt: "desc" },
    take: 10,
  });

  const factors: RiskFactor[] = [];

  // ─── Mood trend ──────────────────────────────────────────────────────
  const moodValues = checkIns.map((c) => c.mood);
  const moodSlope = computeSlope(moodValues);
  const moodRisk = slopeToRisk(moodSlope, 15);

  if (moodValues.length >= 3) {
    factors.push({
      factor: "mood_trend",
      label: "Mood Trend",
      value: Number(moodSlope.toFixed(3)),
      weight: 0.35,
      description:
        moodSlope < -0.1
          ? `Your mood has been declining (${moodSlope.toFixed(2)} pts/day over ${moodValues.length} days).`
          : moodSlope > 0.1
          ? `Your mood is improving (${moodSlope.toFixed(2)} pts/day over ${moodValues.length} days).`
          : `Your mood has been relatively stable over the past ${moodValues.length} days.`,
    });
  }

  // ─── Stress trend ────────────────────────────────────────────────────
  const stressValues = checkIns.map((c) => c.stress);
  const stressSlope = computeSlope(stressValues);
  // Positive stress slope = worse (more stress), so we flip
  const stressRiskComputed = slopeToRisk(-stressSlope, 15);

  if (stressValues.length >= 3) {
    factors.push({
      factor: "stress_trend",
      label: "Stress Level",
      value: Number(stressSlope.toFixed(3)),
      weight: 0.3,
      description:
        stressSlope > 0.1
          ? `Your stress has been rising (${stressSlope.toFixed(2)} pts/day over ${stressValues.length} days).`
          : stressSlope < -0.1
          ? `Your stress has been decreasing (${stressSlope.toFixed(2)} pts/day over ${stressValues.length} days).`
          : `Your stress levels have been stable over the past ${stressValues.length} days.`,
    });
  }

  // ─── Sleep trend ─────────────────────────────────────────────────────
  const sleepValues = checkIns.map((c) => c.sleepQuality);
  const sleepSlope = computeSlope(sleepValues);
  const sleepRisk = slopeToRisk(sleepSlope, 12);

  const avgSleepHours =
    checkIns.filter((c) => c.sleepHours !== null).reduce((s, c) => s + (c.sleepHours ?? 0), 0) /
    Math.max(checkIns.filter((c) => c.sleepHours !== null).length, 1);

  if (sleepValues.length >= 3) {
    factors.push({
      factor: "sleep_quality",
      label: "Sleep Quality",
      value: Number(sleepSlope.toFixed(3)),
      weight: 0.25,
      description:
        sleepSlope < -0.1
          ? `Your sleep quality is declining. Average sleep: ${avgSleepHours.toFixed(1)} hrs/night.`
          : avgSleepHours < 6
          ? `You're averaging only ${avgSleepHours.toFixed(1)} hours of sleep, below the recommended 7-9 hrs.`
          : `Your sleep has been averaging ${avgSleepHours.toFixed(1)} hours per night.`,
    });
  }

  // ─── Energy trend ────────────────────────────────────────────────────
  const energyValues = checkIns.map((c) => c.energy);
  const energySlope = computeSlope(energyValues);
  const energyRisk = slopeToRisk(energySlope, 12);

  if (energyValues.length >= 3) {
    factors.push({
      factor: "energy_trend",
      label: "Energy Level",
      value: Number(energySlope.toFixed(3)),
      weight: 0.2,
      description:
        energySlope < -0.1
          ? `Your energy levels have been declining over the past ${energyValues.length} days.`
          : `Your energy levels have been ${energySlope > 0.1 ? "improving" : "stable"} recently.`,
    });
  }

  // ─── Journal negativity ──────────────────────────────────────────────
  let journalRisk = 50;
  if (recentAnalyses.length > 0) {
    const avgNegativity =
      recentAnalyses.reduce((s, a) => s + a.negativityScore, 0) / recentAnalyses.length;
    journalRisk = clamp(avgNegativity * 100);
    factors.push({
      factor: "journal_negativity",
      label: "Journal Sentiment",
      value: Number(avgNegativity.toFixed(3)),
      weight: 0.2,
      description:
        avgNegativity > 0.6
          ? `Recent journal entries show significant negative patterns (${(avgNegativity * 100).toFixed(0)}% negativity).`
          : avgNegativity > 0.3
          ? `Your journals reflect moderate negative themes. Consider exploring reframing techniques.`
          : `Your journal entries are mostly positive. Keep it up!`,
    });
  }

  // ─── PHQ-9 / GAD-7 baseline adjustments ─────────────────────────────
  let phqAdjust = 0;
  let gadAdjust = 0;
  if (baseline?.phq9Score !== null && baseline?.phq9Score !== undefined) {
    phqAdjust = clamp((baseline.phq9Score / PHQ9_MAX) * PHQ9_SCALE_FACTOR - PHQ9_BASELINE_OFFSET);
  }
  if (baseline?.gad7Score !== null && baseline?.gad7Score !== undefined) {
    gadAdjust = clamp((baseline.gad7Score / GAD7_MAX) * GAD7_SCALE_FACTOR - GAD7_BASELINE_OFFSET);
  }

  // ─── Weighted final scores ───────────────────────────────────────────
  const hasCheckIns = checkIns.length >= 3;

  let depressionRisk: number;
  let stressRisk: number;
  let generalRisk: number;

  if (hasCheckIns) {
    depressionRisk = clamp(
      moodRisk * 0.35 + sleepRisk * 0.25 + energyRisk * 0.2 + journalRisk * 0.2 + phqAdjust * 0.1
    );
    stressRisk = clamp(
      stressRiskComputed * 0.4 + sleepRisk * 0.2 + moodRisk * 0.2 + journalRisk * 0.1 + gadAdjust * 0.1
    );
    generalRisk = clamp((depressionRisk * 0.5 + stressRisk * 0.5));
  } else {
    // Fallback to baseline scores only
    depressionRisk = clamp(phqAdjust > 0 ? phqAdjust + 30 : 40);
    stressRisk = clamp(gadAdjust > 0 ? gadAdjust + 30 : 40);
    generalRisk = clamp((depressionRisk + stressRisk) / 2);
  }

  return {
    depressionRisk: Math.round(depressionRisk),
    stressRisk: Math.round(stressRisk),
    generalRisk: Math.round(generalRisk),
    factors,
  };
}

export async function computeAndSaveRisk(userId: string) {
  const result = await computeRiskForUser(userId);

  const riskScore = await prisma.riskScore.create({
    data: {
      userId,
      depressionRisk: result.depressionRisk,
      stressRisk: result.stressRisk,
      generalRisk: result.generalRisk,
      explanations: {
        create: result.factors.map((f) => ({
          factor: f.factor,
          label: f.label,
          value: f.value,
          weight: f.weight,
          description: f.description,
        })),
      },
    },
    include: { explanations: true },
  });

  // Fire alert if risk crosses thresholds
  if (result.generalRisk >= 70) {
    await prisma.alert.create({
      data: {
        userId,
        riskScoreId: riskScore.id,
        type: "RISK_THRESHOLD",
        severity: result.generalRisk >= 85 ? "CRITICAL" : "HIGH",
        title: "High Risk Score Detected",
        message: `Your overall wellbeing risk score has reached ${result.generalRisk}/100. Please consider reaching out to a mental health professional or using the companion exercises.`,
        isRead: false,
      },
    });
  } else if (result.generalRisk >= 50) {
    await prisma.alert.create({
      data: {
        userId,
        riskScoreId: riskScore.id,
        type: "RISK_THRESHOLD",
        severity: "MEDIUM",
        title: "Elevated Wellbeing Risk",
        message: `Your recent check-ins suggest elevated stress or mood concerns. Risk score: ${result.generalRisk}/100. Explore the companion for personalized support.`,
        isRead: false,
      },
    });
  }

  return riskScore;
}
