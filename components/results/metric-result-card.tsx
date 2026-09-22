import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RawAnswerSheet } from "@/components/results/raw-answer-sheet";
import { scoreTier, TIER_BG_CLASS } from "@/lib/scoring/tier";
import type { MetricResult } from "@/types/evaluation-record";

interface MetricResultCardProps {
  result: MetricResult;
}

const TYPE_LABELS: Record<MetricResult["type"], string> = {
  score: "Score",
  noul: "Yes/No",
  choice: "Category",
};

export function MetricResultCard({ result }: MetricResultCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{result.label}</p>
          <Badge variant="outline">{TYPE_LABELS[result.type]}</Badge>
        </div>

        <p className="flex-1 text-sm text-[var(--muted-foreground)]">{result.resolvedLabel}</p>

        {result.contributesToScore && result.normalizedScore !== null ? (
          <div className="flex items-center gap-2">
            <Progress
              value={result.normalizedScore * 100}
              className="h-1.5 flex-1"
              indicatorClassName={TIER_BG_CLASS[scoreTier(result.normalizedScore * 100).variant]}
            />
            <span className="w-9 shrink-0 text-right font-mono text-xs text-[var(--muted-foreground)]">
              {Math.round(result.normalizedScore * 100)}%
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Descriptive only — not counted in the match score.
          </p>
        )}

        <div className="flex items-center justify-between">
          {result.contributesToScore ? (
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Weight {result.weight.toFixed(2)}
            </span>
          ) : (
            <span />
          )}
          <RawAnswerSheet result={result} />
        </div>
      </CardContent>
    </Card>
  );
}
