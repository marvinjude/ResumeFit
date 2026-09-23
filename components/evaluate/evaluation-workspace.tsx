"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Sparkles } from "lucide-react";
import { JdResumeForm } from "@/components/evaluate/jd-resume-form";
import { EvaluationStatus } from "@/components/evaluation/evaluation-status";
import { ResultsTabs } from "@/components/results/results-tabs";
import { Button } from "@/components/ui/button";
import type { EvaluateStreamEvent, EvaluationRecord } from "@/types/evaluation-record";

interface ConfigStatus {
  claudeConfigured: boolean;
  jevConfigured: boolean;
}

interface EvaluationWorkspaceProps {
  initialRecord?: EvaluationRecord;
}

export function EvaluationWorkspace({ initialRecord }: EvaluationWorkspaceProps) {
  const router = useRouter();

  const [jobDescription, setJobDescription] = React.useState(initialRecord?.jobDescription ?? "");
  const [resume, setResume] = React.useState(initialRecord?.resume ?? "");
  const [status, setStatus] = React.useState<"idle" | "running" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(0);
  const [record, setRecord] = React.useState<EvaluationRecord | null>(initialRecord ?? null);
  const [config, setConfig] = React.useState<ConfigStatus | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Below lg the two panes stack, so the results sit under the form — bring
  // them into view when there's something to show.
  const scrollToResults = React.useCallback((behavior: ScrollBehavior) => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    resultsRef.current?.scrollIntoView({ behavior, block: "start" });
  }, []);

  React.useEffect(() => {
    if (initialRecord) scrollToResults("auto");
  }, [initialRecord, scrollToResults]);

  React.useEffect(() => {
    fetch("/api/evaluate")
      .then((res) => res.json())
      .then((data: ConfigStatus) => setConfig(data))
      .catch(() => setConfig({ claudeConfigured: false, jevConfigured: false }));
  }, []);

  const evaluate = React.useCallback(async () => {
    setStatus("running");
    setError(null);
    scrollToResults("smooth");
    setStep(0);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });
      // Request validation / config errors come back as a plain JSON error
      // before the stream starts.
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong while evaluating.");
      }
      const newRecord = await readEvaluationStream(res.body, setStep);
      setRecord(newRecord);
      setStatus("idle");
      router.push(`/evaluations/${newRecord.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong while evaluating.");
    }
  }, [jobDescription, resume, router, scrollToResults]);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:px-8 lg:min-h-0 lg:grid-cols-2">
      <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] lg:min-h-0 lg:overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto">
          <JdResumeForm
            jobDescription={jobDescription}
            resume={resume}
            onJobDescriptionChange={setJobDescription}
            onResumeChange={setResume}
            onSubmit={evaluate}
            submitting={status === "running"}
            claudeConfigured={config?.claudeConfigured ?? null}
            jevConfigured={config?.jevConfigured ?? null}
            hasResult={record !== null}
          />
        </div>
      </div>

      <div
        ref={resultsRef}
        className="flex scroll-mt-4 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] lg:min-h-0 lg:overflow-hidden"
      >
        <div className="flex min-h-56 flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6 lg:min-h-0 lg:overflow-y-auto">
          {status === "running" ? (
            <div className="flex flex-1 items-center justify-center">
              <EvaluationStatus step={step} />
            </div>
          ) : status === "error" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle className="h-6 w-6 text-[var(--danger)]" />
              <p className="max-w-xs text-sm text-[var(--danger)]">{error}</p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={evaluate}>
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : record ? (
            <ResultsTabs key={record.id} record={record} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <Sparkles className="h-6 w-6 text-[var(--muted-foreground)]" />
              <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
                Your match score will appear here once you evaluate a resume.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Reads the NDJSON event stream from POST /api/evaluate, reporting each
 * stage as the server starts it, and resolves with the final record. */
async function readEvaluationStream(
  body: ReadableStream<Uint8Array>,
  onStep: (step: number) => void,
): Promise<EvaluationRecord> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = done ? "" : (lines.pop() ?? "");
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as EvaluateStreamEvent;
      if (event.type === "step") onStep(event.step);
      else if (event.type === "result") return event.record;
      else throw new Error(event.error);
    }
    if (done) throw new Error("The evaluation ended unexpectedly. Please try again.");
  }
}
