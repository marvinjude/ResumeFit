"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { MetricResult } from "@/types/evaluation-record";

interface RawAnswerSheetProps {
  result: MetricResult;
}

export function RawAnswerSheet({ result }: RawAnswerSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-xs md:h-7">
          View raw answer
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{result.label}</SheetTitle>
          <SheetDescription>
            Jev&apos;s raw judgment trace for this metric.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <dl className="flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Type
              </dt>
              <dd className="mt-0.5">{result.type}</dd>
            </div>
            {result.raw.type === "choice" && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Choice
                </dt>
                <dd className="mt-0.5">{result.raw.choice}</dd>
              </div>
            )}
            {result.raw.type === "score" && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Score index
                </dt>
                <dd className="mt-0.5">{result.raw.score}</dd>
              </div>
            )}
            {result.raw.type === "noul" && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Probability (true)
                </dt>
                <dd className="mt-0.5">{Math.round(result.raw.noul * 100)}%</dd>
              </div>
            )}
            {"confidence" in result.raw && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Confidence
                </dt>
                <dd className="mt-0.5">{Math.round(result.raw.confidence * 100)}%</dd>
              </div>
            )}
            {"probabilities" in result.raw && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Probabilities
                </dt>
                <dd className="mt-1 flex flex-col gap-1">
                  {Object.entries(result.raw.probabilities).map(([key, prob]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <span className="truncate text-[var(--muted-foreground)]">
                        {result.raw.type === "score" && "legend" in result.raw
                          ? (result.raw.legend[key] ?? key)
                          : key}
                      </span>
                      <span className="shrink-0 font-mono text-xs">
                        {Math.round(prob * 100)}%
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </SheetContent>
    </Sheet>
  );
}
