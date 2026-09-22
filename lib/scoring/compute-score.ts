import type { JevAnswer } from "@/types/evaluation";
import type { MetricResult } from "@/types/evaluation-record";
import type { ScoringObject } from "@/types/scoring";
import { clamp, round1 } from "@/lib/utils";

/**
 * Jev never returns a single "overall score" — it answers narrow, bounded
 * questions about each metric. This module owns the arithmetic that turns
 * those independent judgments into one weighted match score.
 *
 * "choice" metrics (categorical, e.g. "career progression") aren't
 * inherently good or bad, so they are excluded from the weighted average
 * and shown as descriptive-only in the UI.
 */

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function computeMetricResults(
  scoringObject: ScoringObject,
  answers: Record<string, JevAnswer>,
): MetricResult[] {
  const results: MetricResult[] = [];

  for (const [key, metric] of Object.entries(scoringObject)) {
    const answer = answers[key];
    if (!answer || answer.type !== metric.type) {
      console.warn(`Jev answer for "${key}" is missing or type-mismatched; excluding from results.`);
      continue;
    }

    const label = humanizeKey(key);

    if (metric.type === "score" && answer.type === "score") {
      const maxIndex = metric.criteria.length - 1;
      const normalizedScore = maxIndex > 0 ? clamp(answer.score / maxIndex, 0, 1) : 0;
      const resolvedLabel = metric.criteria[Math.round(clamp(answer.score, 0, maxIndex))] ?? "";
      results.push({
        key,
        type: "score",
        weight: metric.weight,
        label,
        raw: answer,
        normalizedScore,
        contributesToScore: true,
        resolvedLabel,
        confidence: answer.confidence,
      });
    } else if (metric.type === "noul" && answer.type === "noul") {
      const normalizedScore = clamp(answer.noul, 0, 1);
      const resolvedLabel =
        normalizedScore >= 0.5
          ? (metric.criteria?.true ?? "True")
          : (metric.criteria?.false ?? "False");
      results.push({
        key,
        type: "noul",
        weight: metric.weight,
        label,
        raw: answer,
        normalizedScore,
        contributesToScore: true,
        resolvedLabel,
      });
    } else if (metric.type === "choice" && answer.type === "choice") {
      const resolvedLabel = metric.criteria[answer.choice] ?? answer.choice;
      results.push({
        key,
        type: "choice",
        weight: metric.weight,
        label,
        raw: answer,
        normalizedScore: null,
        contributesToScore: false,
        resolvedLabel,
        confidence: answer.confidence,
      });
    }
  }

  return results;
}

export function computeOverallScore(metricResults: MetricResult[]): number {
  const scoring = metricResults.filter(
    (m) => m.contributesToScore && m.normalizedScore !== null,
  );
  const totalWeight = scoring.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight <= 0) {
    console.warn("No scoring metrics with positive weight; overall score defaults to 0.");
    return 0;
  }
  const weightedSum = scoring.reduce(
    (sum, m) => sum + m.weight * (m.normalizedScore ?? 0),
    0,
  );
  return round1(clamp((weightedSum / totalWeight) * 100, 0, 100));
}
