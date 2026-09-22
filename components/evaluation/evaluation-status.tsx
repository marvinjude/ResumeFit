"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MESSAGES = [
  "Generating scoring rubric with an LLM…",
  "Scoring the resume with Jev…",
  "Computing the weighted match score…",
];

const STAGES = [
  "Generate scoring rubric (LLM)",
  "Score resume against rubric (Typesafe Jev)",
  "Compute weighted match score",
];

/**
 * A simple, honest "working on it" indicator: cycles through a few status
 * lines, an indeterminate-feeling progress bar, and the pipeline stages
 * this run passes through — while the single evaluation request is in
 * flight. No candidate counts, just visible progress.
 */
export function EvaluationStatus() {
  const [index, setIndex] = React.useState(0);
  const [value, setValue] = React.useState(8);
  const [checked, setChecked] = React.useState(0);

  React.useEffect(() => {
    const textTimer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1500);
    const barTimer = setInterval(() => {
      setValue((v) => (v < 92 ? v + (92 - v) * 0.1 + 1 : v));
    }, 200);
    const checkTimer = setInterval(() => {
      setChecked((c) => (c < STAGES.length ? c + 1 : 0));
    }, 900);
    return () => {
      clearInterval(textTimer);
      clearInterval(barTimer);
      clearInterval(checkTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 px-8 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium">{MESSAGES[index]}</p>
        <Progress value={value} className="w-48" />
      </div>

      <ul className="flex w-full flex-col gap-1.5 text-left">
        {STAGES.map((stage, i) => {
          const isChecked = i < checked;
          return (
            <li
              key={stage}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
            >
              {isChecked ? (
                <Check className="h-3 w-3 shrink-0 text-[var(--success)]" />
              ) : (
                <span className="h-3 w-3 shrink-0 rounded-full border border-[var(--border-strong)]" />
              )}
              <span className={isChecked ? "text-[var(--foreground)]" : ""}>
                {stage}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
