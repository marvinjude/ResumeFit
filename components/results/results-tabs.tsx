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
  const activeIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-4 flex justify-center border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-4 sm:-mx-6 sm:px-6 sm:pt-6">
        <div
          role="tablist"
          className="relative grid auto-cols-fr grid-flow-col rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1"
        >
          {/* Sliding indicator behind the active tab. */}
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 rounded-md bg-[var(--card)] shadow-sm transition-transform duration-200 ease-out"
            style={{
              width: `calc((100% - 0.5rem) / ${TABS.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative rounded-md px-4 py-1 text-sm font-medium transition-colors",
                tab === t.id
                  ? "text-[var(--foreground)]"
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
