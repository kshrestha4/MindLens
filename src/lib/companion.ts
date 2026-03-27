import { InterventionType } from "@prisma/client";

export interface Intervention {
  type: InterventionType;
  title: string;
  content: string;
}

// ─── Intervention library ────────────────────────────────────────────────────

const BREATHING_EXERCISES: Intervention[] = [
  {
    type: InterventionType.BREATHING,
    title: "4-7-8 Breathing",
    content:
      "This technique activates your parasympathetic nervous system:\n\n1. Exhale completely through your mouth\n2. Close your mouth and inhale through your nose for **4 seconds**\n3. Hold your breath for **7 seconds**\n4. Exhale completely through your mouth for **8 seconds**\n\nRepeat 3–4 cycles. Practice twice daily for best results.",
  },
  {
    type: InterventionType.BREATHING,
    title: "Box Breathing",
    content:
      "Used by Navy SEALs to stay calm under pressure:\n\n1. Inhale through your nose for **4 seconds**\n2. Hold your breath for **4 seconds**\n3. Exhale through your mouth for **4 seconds**\n4. Hold empty for **4 seconds**\n\nRepeat 4–6 times. Great for managing acute stress.",
  },
  {
    type: InterventionType.BREATHING,
    title: "Diaphragmatic Breathing",
    content:
      "Deep belly breathing reduces cortisol and calms your nervous system:\n\n1. Place one hand on your chest, one on your belly\n2. Breathe in through your nose — your belly should rise, not your chest\n3. Exhale slowly through pursed lips\n4. Aim for 6–10 breaths per minute\n\nPractice for 5–10 minutes whenever you feel tense.",
  },
];

const COGNITIVE_REFRAMING: Intervention[] = [
  {
    type: InterventionType.COGNITIVE_REFRAMING,
    title: "The 3-Column Technique",
    content:
      "Challenge distorted thinking with this CBT classic:\n\n**Column 1:** Write the automatic negative thought\n**Column 2:** Identify the cognitive distortion (catastrophizing? all-or-nothing thinking? mind reading?)\n**Column 3:** Write a more balanced, realistic alternative\n\nExample:\n- Thought: \"I always mess everything up\"\n- Distortion: Overgeneralization\n- Reframe: \"I made a mistake this time. I've also succeeded at many things.\"",
  },
  {
    type: InterventionType.COGNITIVE_REFRAMING,
    title: "The Best Friend Test",
    content:
      "We're often our harshest critics. Try this:\n\nThink of the negative thought you're having about yourself. Now imagine your best friend came to you with that exact situation and thought.\n\nWhat would you say to them? Write it down.\n\nNow — can you say that same compassionate response to yourself?\n\nThis activates self-compassion and reduces self-criticism.",
  },
  {
    type: InterventionType.COGNITIVE_REFRAMING,
    title: "Evidence Examination",
    content:
      "When caught in negative thoughts, examine the evidence:\n\n1. State your negative belief clearly\n2. List all evidence SUPPORTING the belief\n3. List all evidence AGAINST the belief\n4. Write a balanced conclusion based on all evidence\n\nThis technique counters confirmation bias and builds realistic thinking.",
  },
];

const BEHAVIORAL_ACTIVATION: Intervention[] = [
  {
    type: InterventionType.BEHAVIORAL_ACTIVATION,
    title: "Activity Scheduling",
    content:
      "Depression often reduces motivation, creating a vicious cycle. Break it with behavioral activation:\n\n1. Make a list of activities that used to give you pleasure or a sense of accomplishment\n2. Schedule one small activity today — even 10 minutes counts\n3. After doing it, rate your mood before and after (0-10)\n4. Notice: mood often improves after action, even when motivation was low\n\nStart small. A short walk, a call to a friend, or a creative hobby all count.",
  },
  {
    type: InterventionType.BEHAVIORAL_ACTIVATION,
    title: "Opposite Action",
    content:
      "When depression urges withdrawal, do the opposite:\n\n- Feel like isolating? Reach out to one person.\n- Feel like staying in bed? Get up and walk around the block.\n- Feel like avoiding tasks? Do just 5 minutes of one task.\n\nThe key insight: we don't wait to feel motivated to act. We act, and motivation often follows.\n\nToday's challenge: Pick one thing depression is telling you to avoid, and do a tiny version of it.",
  },
];

const SLEEP_HYGIENE: Intervention[] = [
  {
    type: InterventionType.SLEEP_HYGIENE,
    title: "Wind-Down Protocol",
    content:
      "Build a consistent 30–60 minute pre-sleep routine:\n\n**60 min before bed:**\n- Dim lights and switch to warm-toned screens\n- Stop work emails and stressful content\n\n**30 min before bed:**\n- Put your phone in another room or use Night Mode\n- Try light reading, stretching, or journaling\n\n**15 min before bed:**\n- Write tomorrow's top 3 priorities (offloads mental churn)\n- Practice 5 minutes of breathing exercises\n\nConsistency matters more than perfection.",
  },
  {
    type: InterventionType.SLEEP_HYGIENE,
    title: "Sleep Hygiene Checklist",
    content:
      "Review these evidence-based sleep practices:\n\n✓ Same bedtime and wake time every day (including weekends)\n✓ Keep bedroom cool (65–68°F / 18–20°C)\n✓ Blackout curtains or sleep mask\n✓ No caffeine after 2 PM\n✓ No alcohol within 3 hours of sleep\n✓ Exercise — but not within 2 hours of bedtime\n✓ Get natural light exposure in the morning\n\nWhich of these are you currently missing? Pick one to implement this week.",
  },
];

const MINDFULNESS: Intervention[] = [
  {
    type: InterventionType.MINDFULNESS,
    title: "5-4-3-2-1 Grounding",
    content:
      "This sensory grounding technique interrupts anxiety and brings you to the present:\n\nNotice and name:\n- **5 things you can see**\n- **4 things you can physically feel** (floor under feet, fabric on skin)\n- **3 things you can hear**\n- **2 things you can smell**\n- **1 thing you can taste**\n\nTake a slow breath after each sense. This grounds you in the present moment and reduces anxious rumination.",
  },
  {
    type: InterventionType.MINDFULNESS,
    title: "3-Minute Breathing Space",
    content:
      "A micro-meditation from MBCT (Mindfulness-Based Cognitive Therapy):\n\n**Minute 1 — Awareness:** \"What am I experiencing right now?\" Notice thoughts, feelings, and bodily sensations without judgment.\n\n**Minute 2 — Focus:** Gather attention on the breath. Feel each inhale and exhale.\n\n**Minute 3 — Expand:** Expand awareness to your whole body and surroundings.\n\nPractice this 2-3 times daily, especially during stressful moments.",
  },
];

const GRATITUDE: Intervention[] = [
  {
    type: InterventionType.GRATITUDE,
    title: "Three Good Things",
    content:
      "Research by Martin Seligman shows this practice significantly boosts wellbeing:\n\nEach evening, write down 3 things that went well today — big or small.\n\nFor each item, answer: **Why did this good thing happen?**\n\nExamples:\n- \"I had a good coffee this morning — because I made time for myself\"\n- \"A colleague helped me — because I've built good relationships\"\n\nDo this for 7 consecutive days and notice the shift in perspective.",
  },
  {
    type: InterventionType.GRATITUDE,
    title: "Gratitude Letter",
    content:
      "One of the most powerful positive psychology exercises:\n\n1. Think of someone who has had a positive impact on your life and whom you've never properly thanked\n2. Write a detailed letter (a few paragraphs) explaining what they did and why it mattered to you\n3. If possible, read it to them in person\n\nStudies show this exercise creates lasting increases in happiness and decreases in depression, even when the letter is never sent.",
  },
];

// ─── Selection logic ──────────────────────────────────────────────────────────

export interface CompanionContext {
  moodScore?: number;
  stressScore?: number;
  sleepQualityScore?: number;
  energyScore?: number;
  depressionRisk?: number;
  stressRisk?: number;
  primaryEmotion?: string;
}

export function selectInterventions(
  context: CompanionContext,
  count = 3
): Intervention[] {
  const { moodScore = 5, stressScore = 5, sleepQualityScore = 5, energyScore = 5, depressionRisk = 50, stressRisk = 50, primaryEmotion } = context;

  const weighted: Array<{ intervention: Intervention; weight: number }> = [];

  // Breathing — high stress or anxiety
  for (const i of BREATHING_EXERCISES) {
    const w = stressScore >= 7 || stressRisk >= 65 || primaryEmotion === "anxiety" ? 3 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Cognitive reframing — low mood or negative journal
  for (const i of COGNITIVE_REFRAMING) {
    const w = moodScore <= 4 || depressionRisk >= 55 ? 3 : primaryEmotion === "sadness" ? 2 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Behavioral activation — low energy + low mood
  for (const i of BEHAVIORAL_ACTIVATION) {
    const w = energyScore <= 4 && moodScore <= 5 ? 3 : depressionRisk >= 60 ? 2 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Sleep hygiene — poor sleep
  for (const i of SLEEP_HYGIENE) {
    const w = sleepQualityScore <= 4 ? 3 : sleepQualityScore <= 6 ? 2 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Mindfulness — moderate/high stress or anxiety
  for (const i of MINDFULNESS) {
    const w = stressScore >= 6 || primaryEmotion === "anxiety" ? 2 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Gratitude — low mood, helpful as a mood booster
  for (const i of GRATITUDE) {
    const w = moodScore <= 5 ? 2 : 1;
    weighted.push({ intervention: i, weight: w });
  }

  // Weighted random selection
  const totalWeight = weighted.reduce((s, { weight }) => s + weight, 0);
  const selected: Intervention[] = [];
  const usedTitles = new Set<string>();

  let attempts = 0;
  while (selected.length < count && attempts < 200) {
    attempts++;
    let rand = Math.random() * totalWeight;
    for (const { intervention, weight } of weighted) {
      rand -= weight;
      if (rand <= 0 && !usedTitles.has(intervention.title)) {
        selected.push(intervention);
        usedTitles.add(intervention.title);
        break;
      }
    }
  }

  return selected;
}
