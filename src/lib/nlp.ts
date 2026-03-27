/** Lightweight lexicon-based NLP for journal entry analysis */

// AFINN-style sentiment lexicon (subset)
const SENTIMENT_LEXICON: Record<string, number> = {
  // Positive
  happy: 3, joy: 3, joyful: 3, love: 3, wonderful: 3, amazing: 3, fantastic: 3,
  great: 2, good: 2, better: 2, improve: 2, hope: 2, hopeful: 2, grateful: 2,
  gratitude: 2, thankful: 2, calm: 2, peaceful: 2, relaxed: 2, proud: 2,
  accomplished: 2, excited: 2, motivated: 2, energized: 2, strong: 2,
  positive: 2, optimistic: 2, smile: 2, laugh: 2, friend: 1, support: 1,
  helped: 1, okay: 1, fine: 1, manageable: 1, progress: 1, productive: 1,
  // Negative
  sad: -2, sadness: -2, depressed: -3, depression: -3, anxious: -3, anxiety: -3,
  worried: -2, worry: -2, fear: -2, afraid: -2, terrified: -3, panic: -3,
  stressed: -2, stress: -2, overwhelmed: -3, exhausted: -2, tired: -2,
  hopeless: -3, worthless: -3, empty: -2, lonely: -2, alone: -2, isolated: -2,
  miserable: -3, terrible: -3, awful: -3, horrible: -3, bad: -2, worse: -2,
  failing: -2, failed: -2, useless: -2, hate: -3, anger: -2, angry: -2,
  furious: -3, irritated: -2, frustrated: -2, helpless: -3, crying: -2,
  cry: -2, difficult: -1, hard: -1, struggle: -2, struggling: -2,
  insomnia: -2, nightmares: -2, sleepless: -2,
};

// Emotion keyword clusters
const EMOTION_CLUSTERS: Record<string, string[]> = {
  sadness: ["sad", "crying", "cry", "tears", "grief", "loss", "empty", "lonely", "alone", "isolated", "depressed", "hopeless", "worthless", "miserable"],
  anxiety: ["anxious", "anxiety", "worried", "worry", "fear", "afraid", "panic", "nervous", "terrified", "dread", "tense", "overwhelmed", "stressed"],
  anger: ["angry", "anger", "furious", "irritated", "frustrated", "rage", "hate", "annoyed", "bitter"],
  joy: ["happy", "joyful", "joy", "excited", "thrilled", "delighted", "cheerful", "smile", "laugh"],
  hope: ["hope", "hopeful", "optimistic", "better", "improve", "progress", "forward", "possibility"],
  gratitude: ["grateful", "gratitude", "thankful", "appreciate", "blessed", "fortunate"],
  fatigue: ["tired", "exhausted", "drained", "sleepy", "fatigue", "sluggish", "lethargic"],
};

// Stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "it", "this", "that", "these",
  "those", "i", "me", "my", "we", "our", "you", "your", "he", "she",
  "they", "their", "his", "her", "its", "not", "no", "so", "if", "then",
  "than", "just", "very", "really", "much", "more", "most", "some",
  "about", "up", "out", "from", "by", "what", "when", "how", "all",
  "also", "as", "into", "there", "here", "because", "through",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export interface NLPAnalysis {
  sentimentScore: number;   // -1 to 1
  negativityScore: number;  // 0 to 1
  emotion: string;
  keywords: string[];
}

export function analyzeText(text: string): NLPAnalysis {
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return { sentimentScore: 0, negativityScore: 0.5, emotion: "neutral", keywords: [] };
  }

  // ─── Sentiment scoring ───────────────────────────────────────────────
  let rawScore = 0;
  let scoredCount = 0;

  for (const token of tokens) {
    const score = SENTIMENT_LEXICON[token];
    if (score !== undefined) {
      rawScore += score;
      scoredCount++;
    }
  }

  // Normalize to -1..1 range
  const sentimentScore = scoredCount > 0
    ? Math.max(-1, Math.min(1, rawScore / (scoredCount * 3)))
    : 0;

  // ─── Negativity score 0..1 ──────────────────────────────────────────
  // Count negative word density
  let negativeCount = 0;
  let positiveCount = 0;
  for (const token of tokens) {
    const score = SENTIMENT_LEXICON[token];
    if (score !== undefined) {
      if (score < 0) negativeCount++;
      else if (score > 0) positiveCount++;
    }
  }
  const totalScoredWords = negativeCount + positiveCount;
  const negativityScore = totalScoredWords > 0
    ? negativeCount / totalScoredWords
    : 0.5;

  // ─── Emotion detection ──────────────────────────────────────────────
  const emotionScores: Record<string, number> = {};
  for (const [emotion, keywords] of Object.entries(EMOTION_CLUSTERS)) {
    emotionScores[emotion] = tokens.filter((t) => keywords.includes(t)).length;
  }
  const primaryEmotion = Object.entries(emotionScores).sort((a, b) => b[1] - a[1])[0];
  const emotion = primaryEmotion[1] > 0 ? primaryEmotion[0] : sentimentScore > 0.1 ? "contentment" : sentimentScore < -0.1 ? "distress" : "neutral";

  // ─── Keyword extraction ──────────────────────────────────────────────
  const wordFreq: Record<string, number> = {};
  for (const token of tokens) {
    if (!STOP_WORDS.has(token) && token.length > 3) {
      wordFreq[token] = (wordFreq[token] ?? 0) + 1;
    }
  }

  // Also boost sentiment-bearing words
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => {
      const sentA = Math.abs(SENTIMENT_LEXICON[a[0]] ?? 0);
      const sentB = Math.abs(SENTIMENT_LEXICON[b[0]] ?? 0);
      // Sort by sentiment strength first, then frequency
      return sentB - sentA || b[1] - a[1];
    })
    .slice(0, 8)
    .map(([word]) => word);

  return { sentimentScore, negativityScore, emotion, keywords };
}
