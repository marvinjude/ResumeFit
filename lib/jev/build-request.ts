import type { JevDecisionRequest, JevQuestion } from "@/types/evaluation";
import type { MetricInstructions, ScoringObject } from "@/types/scoring";
import { MATCH_LEVEL_KEY, MATCH_LEVEL_QUESTION } from "@/lib/scoring/match-level";
import { JEV_MODEL } from "@/lib/jev/model";

/**
 * Jev questions only accept a plain instructions string, so a date-relative
 * metric's {question, today} form is flattened into one sentence here.
 */
export function resolveInstructions(instructions: MetricInstructions): string {
  if (typeof instructions === "string") return instructions;
  return `${instructions.question} (Today's date: ${instructions.today}.)`;
}

/**
 * Converts the Claude-generated scoring object into the Record<string,
 * JevQuestion> Jev expects — strips `weight`, since Jev only needs to know
 * how to judge each metric, not how important it is to the final score.
 */
export function scoringObjectToJevQuestions(
  scoringObject: ScoringObject,
): Record<string, JevQuestion> {
  const questions: Record<string, JevQuestion> = {};
  for (const [key, metric] of Object.entries(scoringObject)) {
    const instructions = resolveInstructions(metric.instructions);
    if (metric.type === "score") {
      questions[key] = { type: "score", instructions, criteria: metric.criteria };
    } else if (metric.type === "choice") {
      questions[key] = { type: "choice", instructions, criteria: metric.criteria };
    } else {
      questions[key] = { type: "noul", instructions, criteria: metric.criteria };
    }
  }
  return questions;
}

/**
 * Builds the "state" object sent to Jev: just the resume text being judged.
 * The job description already shaped the rubric's questions/criteria (via
 * Claude), so every question here is self-contained and answerable from the
 * resume alone — no need to hand Jev the job description a second time.
 */
export function buildResumeMatchState(resume: string): Record<string, unknown> {
  return { resume };
}

export function buildResumeJevRequest(
  scoringObject: ScoringObject,
  resume: string,
): JevDecisionRequest {
  return {
    state: buildResumeMatchState(resume),
    model: JEV_MODEL,
    questions: {
      ...scoringObjectToJevQuestions(scoringObject),
      [MATCH_LEVEL_KEY]: MATCH_LEVEL_QUESTION,
    },
  };
}
