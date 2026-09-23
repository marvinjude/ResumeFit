"use client";

import { Check, Loader2 } from "lucide-react";
import { NeuralOrb } from "@/components/evaluation/neural-orb";
import { cn } from "@/lib/utils";

const STAGES = [
  "Generate scoring rubric (LLM)",
  "Score resume against rubric (Typesafe Jev)",
  "Compute weighted match score",
];

interface EvaluationStatusProps {
  /** Index of the stage the server is currently running, from the
   * /api/evaluate event stream. Earlier stages are done. */
  step: number;
}

/**
 * Live pipeline progress: a rotating 3D neural-network orb while the run is in flight, and
 * the stage list driven by the server's step events — done stages are
 * ticked, and the spinner sits beside the stage currently running.
 */
export function EvaluationStatus({ step }: EvaluationStatusProps) {
  return (
    <div className="flex flex-col items-center gap-8 px-8 py-12">
      <NeuralOrb />

      <ul className="flex w-full flex-col gap-2 text-left" aria-live="polite">
        {STAGES.map((stage, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={stage}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-sm",
                done || active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
                active && "font-medium",
              )}
            >
              {done ? (
                <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--accent)]" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-3 w-3 rounded-full border border-[var(--border-strong)]" />
                </span>
              )}
              <span>{stage}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
