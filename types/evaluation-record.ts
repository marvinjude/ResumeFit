import type { LlmRequestInfo } from "@/lib/claude/generate-scoring-object";
import type { TokenUsage } from "@/lib/pricing";
import type { JevAnswer, JevDecisionRequest, JevDecisionResponse } from "@/types/evaluation";
import type { MetricType, ScoringObject } from "@/types/scoring";

export interface MetricResult {
  key: string;
  type: MetricType;
  weight: number;
  label: string;
  raw: JevAnswer;
  /** 0-1 for score/noul metrics, null for choice metrics (descriptive only). */
  normalizedScore: number | null;
  contributesToScore: boolean;
  resolvedLabel: string;
  confidence?: number;
}

export interface EvaluationRecord {
  id: string;
  sessionId: string;
  createdAt: string;
  jobDescription: string;
  resume: string;
  llmRequest: LlmRequestInfo;
  /** Claude token usage for the rubric step — absent on older records. */
  llmUsage?: TokenUsage;
  scoringObject: ScoringObject;
  jevRequest: JevDecisionRequest;
  jevResponse: JevDecisionResponse;
  metricResults: MetricResult[];
  overallScore: number;
  persisted: boolean;
}

export interface EvaluationSummary {
  id: string;
  createdAt: string;
  overallScore: number;
  jobTitleGuess: string;
  resumeTitleGuess: string;
}

/** One line of the POST /api/evaluate NDJSON stream. `step` is the index of
 * the pipeline stage that just started (0 rubric, 1 Jev, 2 score + save). */
export type EvaluateStreamEvent =
  | { type: "step"; step: number }
  | { type: "result"; record: EvaluationRecord }
  | { type: "error"; error: string };
