import type { JevAnswer, JevChoiceQuestion } from "@/types/evaluation";
import type { ScoreTierVariant } from "@/lib/scoring/tier";

/**
 * Static metric always appended to the Jev request, regardless of what
 * Claude's per-JD rubric contains. Every other question is tailored by
 * Claude per job description — this one is fixed, so Jev gives one direct,
 * holistic "how would you characterize this match" judgment on every run,
 * shown under the match score percentage. Unlike the rubric's own metrics,
 * this key is intentionally excluded from metricResults / the metric grids
 * (see lib/scoring/compute-score.ts, which only ever reads scoringObject
 * keys) and rendered separately instead.
 */
export const MATCH_LEVEL_KEY = "overall_match_level";

export interface MatchLevelOption {
  label: string;
  description: string;
  variant: ScoreTierVariant;
}

export const MATCH_LEVEL_OPTIONS: Record<string, MatchLevelOption> = {
  strong_match: {
    label: "Strong match",
    description:
      "The candidate meets nearly all requirements and is a strong fit for this role.",
    variant: "success",
  },
  good_match: {
    label: "Good match",
    description: "The candidate meets most requirements, with only minor gaps.",
    variant: "success",
  },
  partial_match: {
    label: "Partial match",
    description: "The candidate meets some requirements but has notable gaps.",
    variant: "warning",
  },
  weak_match: {
    label: "Weak match",
    description: "The candidate meets few requirements and is a poor fit for this role.",
    variant: "danger",
  },
  no_match: {
    label: "No match",
    description: "The candidate does not meet the role's core requirements.",
    variant: "danger",
  },
};

export const MATCH_LEVEL_QUESTION: JevChoiceQuestion = {
  type: "choice",
  instructions:
    "Considering the resume against everything discussed above, holistically, what is the candidate's overall match level for this role?",
  criteria: Object.fromEntries(
    Object.entries(MATCH_LEVEL_OPTIONS).map(([key, option]) => [key, option.description]),
  ),
};

export interface ResolvedMatchLevel {
  key: string;
  label: string;
  variant: ScoreTierVariant;
  confidence: number;
}

/** Reads Jev's answer to the static match-level question out of a raw
 * answers map. Returns null if the answer is missing/malformed (e.g. an
 * older response, or an unexpected choice) rather than throwing —
 * callers fall back to the numeric scoreTier() in that case. */
export function resolveMatchLevel(
  answers: Record<string, JevAnswer>,
): ResolvedMatchLevel | null {
  const answer = answers[MATCH_LEVEL_KEY];
  if (!answer || answer.type !== "choice") return null;
  const option = MATCH_LEVEL_OPTIONS[answer.choice];
  if (!option) return null;
  return { key: answer.choice, label: option.label, variant: option.variant, confidence: answer.confidence };
}
