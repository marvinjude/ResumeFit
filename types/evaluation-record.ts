import type { LlmRequestInfo } from "@/lib/claude/generate-scoring-object";
import type { ResolvedMatchLevel } from "@/lib/scoring/match-level";
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
  /** Jev's own holistic judgment from the static match-level metric —
   * null for older records or if the answer didn't resolve. */
  matchLevel: ResolvedMatchLevel | null;
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
