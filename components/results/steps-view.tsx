import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/results/code-block";
import { SAMPLE_SHAPE } from "@/lib/claude/sample-shape";
import type { EvaluationRecord } from "@/types/evaluation-record";

interface StepsViewProps {
  record: EvaluationRecord;
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function extractUserPrompt(record: EvaluationRecord): string {
  const content = record.llmRequest?.messages?.[0]?.content;
  if (typeof content === "string") return content;
  if (content) return json(content);
  return "Not recorded for this evaluation.";
}

const CLAUDE_CALL_CODE = `// lib/claude/generate-scoring-object.ts

const format = zodOutputFormat(ScoringWireSchema);

const message = await client.messages.parse({
  model: CLAUDE_MODEL,
  max_tokens: 4096,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: userPrompt }],
  output_config: { format },
});

const scoringObject = ScoringObjectSchema.parse(
  wireToScoringObject(message.parsed_output),
);`;

const JEV_CALL_CODE = `// lib/jev/client.ts

const res = await fetch("https://api.typesafe.ai/v1/systemone", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.JEV_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model: "jev-latest", ...request }),
  signal: controller.signal, // 20s timeout
});

const data = await res.json();`;

const COMPUTE_SCORE_CODE = `// lib/scoring/compute-score.ts

function computeOverallScore(metricResults) {
  const scoring = metricResults.filter(
    (m) => m.contributesToScore && m.normalizedScore !== null,
  );
  const totalWeight = scoring.reduce((sum, m) => sum + m.weight, 0);
  const weightedSum = scoring.reduce(
    (sum, m) => sum + m.weight * m.normalizedScore,
    0,
  );
  return round1(clamp((weightedSum / totalWeight) * 100, 0, 100));
}`;

export function StepsView({ record }: StepsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Step n={1} title="Generate scoring rubric" badge={record.llmRequest.llmModelKey}>
        <p className="text-sm text-[var(--muted-foreground)]">
          Based on the job description, an LLM generated {record.metricResults.length} metrics
          tailored to this specific role — including each metric&apos;s weight, which the LLM
          assigns based on how important it judges that requirement to be.
        </p>
        <CodeLabel>Code</CodeLabel>
        <CodeBlock code={CLAUDE_CALL_CODE} language="typescript" />
        <CodeLabel>System prompt</CodeLabel>
        <CodeBlock
          code={
            record.llmRequest?.system ??
            "Not recorded — this evaluation predates the system/user prompt split, so its full prompt is in the user prompt below."
          }
          highlights={[
            { text: SAMPLE_SHAPE, className: "rounded bg-sky-500/25 px-0.5 text-sky-200" },
          ]}
        />
        <CodeLabel>User prompt</CodeLabel>
        <CodeBlock
          code={extractUserPrompt(record)}
          highlights={[
            // The user prompt is JSON, so the job description appears
            // string-escaped; older records carry it verbatim.
            { text: JSON.stringify(record.jobDescription).slice(1, -1), className: "rounded bg-yellow-500/25 px-0.5 text-yellow-200" },
            { text: record.jobDescription, className: "rounded bg-yellow-500/25 px-0.5 text-yellow-200" },
            // Evaluations stored before the system/user split carry the
            // reference example in the user message instead.
            { text: SAMPLE_SHAPE, className: "rounded bg-sky-500/25 px-0.5 text-sky-200" },
          ]}
        />
        <CodeLabel>Result</CodeLabel>
        <CodeBlock code={json(record.scoringObject)} language="json" />
      </Step>

      <Step n={2} title="Score resume against rubric" badge={record.jevResponse.model}>
        <p className="text-sm text-[var(--muted-foreground)]">
          {record.simulated
            ? "Demo Mode fixtures stood in for Jev (JEV_API_KEY not configured)."
            : "Jev answered each metric independently in one call."}{" "}
          Usage: {record.jevResponse.usage.input_tokens.toLocaleString()} input /{" "}
          {record.jevResponse.usage.output_tokens.toLocaleString()} output tokens.
        </p>
        <CodeLabel>Code</CodeLabel>
        <CodeBlock code={JEV_CALL_CODE} language="typescript" />
        <CodeLabel>Request data → POST api.typesafe.ai/v1/systemone</CodeLabel>
        <CodeBlock
          code={json({ ...record.jevRequest, state: { resume: record.resume } })}
          language="json"
        />
        <CodeLabel>Result</CodeLabel>
        <CodeBlock code={json(record.jevResponse)} language="json" />
      </Step>

      <Step n={3} title="Compute weighted match score">
        <p className="text-sm text-[var(--muted-foreground)]">
          Σ(weight × normalized score) / Σ(weight) × 100, over score and yes/no metrics only —
          choice metrics are descriptive and excluded. Final score:{" "}
          <span className="font-semibold text-[var(--foreground)]">{record.overallScore}%</span>.
        </p>
        <CodeLabel>Code</CodeLabel>
        <CodeBlock code={COMPUTE_SCORE_CODE} language="typescript" />
      </Step>
    </div>
  );
}

function CodeLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
      {children}
    </p>
  );
}

function Step({
  n,
  title,
  badge,
  children,
}: {
  n: number;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] font-mono text-xs font-medium">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-medium">{title}</p>
          {badge && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {badge}
            </Badge>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
