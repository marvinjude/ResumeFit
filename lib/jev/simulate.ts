import type { JevChoiceAnswer, JevDecisionResponse, JevNoulAnswer, JevScoreAnswer } from "@/types/evaluation";
import type { ScoringObject } from "@/types/scoring";
import { clamp } from "@/lib/utils";
import { MATCH_LEVEL_KEY, MATCH_LEVEL_OPTIONS } from "@/lib/scoring/match-level";

/**
 * Deterministic Demo Mode fixtures.
 *
 * This is NOT a language model and never reads or reasons about the resume
 * text — it derives plausible-looking probabilities from a seeded
 * pseudo-random generator so results are reproducible for a given (resume,
 * metric) pair. Used only when JEV_API_KEY is not configured, and every
 * result produced this way is flagged `simulated: true` end to end.
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toScore(criteria: string[], position: number): JevScoreAnswer {
  const maxIndex = criteria.length - 1;
  const clamped = clamp(position, 0, maxIndex);
  const lower = Math.floor(clamped);
  const upper = Math.min(lower + 1, maxIndex);
  const frac = clamped - lower;

  const probabilities: Record<string, number> = {};
  criteria.forEach((_, i) => (probabilities[i] = 0));
  probabilities[lower] = round2((probabilities[lower] ?? 0) + (1 - frac));
  probabilities[upper] = round2((probabilities[upper] ?? 0) + frac);

  const legend: Record<string, string> = {};
  criteria.forEach((label, i) => (legend[i] = label));

  return {
    type: "score",
    score: Math.round(clamped * 100) / 100,
    confidence: Math.round((1 - Math.min(frac, 1 - frac) * 2) * 100) / 100,
    legend,
    probabilities,
  };
}

function toNoul(rand: () => number): JevNoulAnswer {
  return { type: "noul", noul: round2(clamp(0.1 + rand() * 0.8, 0.02, 0.98)) };
}

function toChoiceN(rand: () => number, keys: string[]): JevChoiceAnswer {
  if (keys.length === 0) {
    return { type: "choice", choice: "", confidence: 0, probabilities: {} };
  }
  const winnerIndex = Math.floor(rand() * keys.length);
  const winner = keys[winnerIndex];
  const dominant = clamp(0.45 + rand() * 0.45, 0.4, 0.95);
  const remainder = 1 - dominant;
  const probabilities: Record<string, number> = {};
  keys.forEach((key) => {
    probabilities[key] = key === winner ? dominant : remainder / (keys.length - 1 || 1);
  });
  Object.keys(probabilities).forEach((key) => {
    probabilities[key] = round2(probabilities[key]);
  });
  return {
    type: "choice",
    choice: winner,
    confidence: round2(dominant),
    probabilities,
  };
}

export function simulateJevResponse(
  scoringObject: ScoringObject,
  resume: string,
): JevDecisionResponse {
  const answers: JevDecisionResponse["answers"] = {};

  for (const [key, metric] of Object.entries(scoringObject)) {
    const rand = mulberry32(hashSeed(`${resume.length}:${key}`));
    if (metric.type === "score") {
      answers[key] = toScore(metric.criteria, rand() * (metric.criteria.length - 1));
    } else if (metric.type === "noul") {
      answers[key] = toNoul(rand);
    } else {
      answers[key] = toChoiceN(rand, Object.keys(metric.criteria));
    }
  }

  const matchLevelRand = mulberry32(hashSeed(`${resume.length}:${MATCH_LEVEL_KEY}`));
  answers[MATCH_LEVEL_KEY] = toChoiceN(matchLevelRand, Object.keys(MATCH_LEVEL_OPTIONS));

  const approxTokens = Math.round(JSON.stringify(answers).length / 3.5);

  return {
    model: "jev-demo-simulated",
    answers,
    usage: {
      input_tokens: approxTokens * 4,
      output_tokens: approxTokens,
    },
  };
}
