import { NextRequest, NextResponse } from "next/server";
import { callJev, isJevConfigured, JevClientError } from "@/lib/jev/client";
import { simulateJevResponse } from "@/lib/jev/simulate";
import { buildResumeJevRequest } from "@/lib/jev/build-request";
import { generateScoringObject, ClaudeScoringError } from "@/lib/claude/generate-scoring-object";
import { isClaudeConfigured } from "@/lib/claude/client";
import { computeMetricResults, computeOverallScore } from "@/lib/scoring/compute-score";
import { resolveMatchLevel } from "@/lib/scoring/match-level";
import { insertEvaluation } from "@/lib/mongo/evaluations-repo";
import { ensureSessionId } from "@/lib/session/session";
import { MAX_TEXT_LENGTH } from "@/lib/config";
import { generateId } from "@/lib/utils";
import type { EvaluationRecord } from "@/types/evaluation-record";
import type { LlmRequestInfo } from "@/lib/claude/generate-scoring-object";

export const runtime = "nodejs";

/** Lets the client know, before submitting, which providers are configured
 * — never reveals the keys themselves, just their presence. */
export async function GET() {
  return NextResponse.json({
    claudeConfigured: isClaudeConfigured(),
    jevConfigured: isJevConfigured(),
  });
}

interface EvaluateRequestBody {
  jobDescription: string;
  resume: string;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }
  const parsed = body as EvaluateRequestBody;
  const jobDescription = parsed.jobDescription.trim();
  const resume = parsed.resume.trim();

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "CLAUDE_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const sessionId = await ensureSessionId();

  let scoringObject;
  let llmRequest: LlmRequestInfo;
  try {
    const result = await generateScoringObject(jobDescription);
    scoringObject = result.scoringObject;
    llmRequest = result.request;
  } catch (err) {
    console.error("Claude scoring rubric generation failed", err);
    const message =
      err instanceof ClaudeScoringError
        ? err.message
        : "Unable to generate a scoring rubric right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const jevRequest = buildResumeJevRequest(scoringObject, resume);
  const simulated = !isJevConfigured();

  let jevResponse;
  try {
    jevResponse = simulated
      ? simulateJevResponse(scoringObject, resume)
      : await callJev(jevRequest);
  } catch (err) {
    console.error("Jev evaluation failed", err);
    const message =
      err instanceof JevClientError
        ? err.message
        : "Unable to reach Jev right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const metricResults = computeMetricResults(scoringObject, jevResponse.answers);
  const overallScore = computeOverallScore(metricResults);
  const matchLevel = resolveMatchLevel(jevResponse.answers);

  const recordToStore = {
    sessionId,
    createdAt: new Date().toISOString(),
    jobDescription,
    resume,
    llmRequest,
    scoringObject,
    jevRequest,
    jevResponse,
    matchLevel,
    metricResults,
    overallScore,
    simulated,
  };

  let id: string;
  let persisted: boolean;
  try {
    id = await insertEvaluation(recordToStore);
    persisted = true;
  } catch (err) {
    console.error("Failed to persist evaluation to MongoDB", err);
    id = generateId("local");
    persisted = false;
  }

  const record: EvaluationRecord = { ...recordToStore, id, persisted };
  return NextResponse.json({ record });
}

function validateBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Missing request body.";
  const b = body as Partial<EvaluateRequestBody>;
  if (typeof b.jobDescription !== "string" || !b.jobDescription.trim()) {
    return "Job description is required.";
  }
  if (typeof b.resume !== "string" || !b.resume.trim()) {
    return "Resume is required.";
  }
  if (b.jobDescription.length > MAX_TEXT_LENGTH) {
    return `Job description exceeds the ${MAX_TEXT_LENGTH}-character limit.`;
  }
  if (b.resume.length > MAX_TEXT_LENGTH) {
    return `Resume exceeds the ${MAX_TEXT_LENGTH}-character limit.`;
  }
  return null;
}
