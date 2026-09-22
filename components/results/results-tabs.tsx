"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScoringSummary } from "@/components/results/scoring-summary";
import { StepsView } from "@/components/results/steps-view";
import type { EvaluationRecord } from "@/types/evaluation-record";

interface ResultsTabsProps {
  record: EvaluationRecord;
}

const TABS = [
  { id: "result", label: "Result" },
  { id: "steps", label: "Steps" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ResultsTabs({ record }: ResultsTabsProps) {
  const [tab, setTab] = React.useState<TabId>("result");

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-4 flex justify-center border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-4 sm:-mx-6 sm:px-6 sm:pt-6">
        <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-[var(--muted)] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "result" ? <ScoringSummary record={record} /> : <StepsView record={record} />}
    </div>
  );
}
