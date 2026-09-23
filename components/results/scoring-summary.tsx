import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MetricResultCard } from "@/components/results/metric-result-card";
import { scoreTier, TIER_BG_CLASS, TIER_TEXT_CLASS } from "@/lib/scoring/tier";
import { cn } from "@/lib/utils";
import type { EvaluationRecord } from "@/types/evaluation-record";

interface ScoringSummaryProps {
  record: EvaluationRecord;
}

export function ScoringSummary({ record }: ScoringSummaryProps) {
  const scoredMetrics = record.metricResults
    .filter((m) => m.contributesToScore)
    .sort((a, b) => b.weight - a.weight);
  const descriptiveMetrics = record.metricResults.filter((m) => !m.contributesToScore);
  const matchLevel = scoreTier(record.overallScore);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Match score
          </p>
          <p
            className={cn(
              "text-4xl font-semibold tracking-tight",
              TIER_TEXT_CLASS[matchLevel.variant],
            )}
          >
            {record.overallScore}%
          </p>
          <Badge variant={matchLevel.variant} className="mt-1.5">
            {matchLevel.label}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {!record.persisted && <Badge variant="outline">Not saved</Badge>}
        </div>
      </div>
      <Progress
        value={record.overallScore}
        indicatorClassName={TIER_BG_CLASS[matchLevel.variant]}
      />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Scored metrics
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scoredMetrics.map((result) => (
            <MetricResultCard key={result.key} result={result} />
          ))}
        </div>
      </div>

      {descriptiveMetrics.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Candidate profile
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                Categorical, descriptive metrics — not counted in the match score above.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {descriptiveMetrics.map((result) => (
                <MetricResultCard key={result.key} result={result} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
