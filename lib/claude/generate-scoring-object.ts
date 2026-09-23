import "server-only";
import Anthropic, {
  APIError,
  AuthenticationError,
  RateLimitError,
  APIConnectionError,
} from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/claude/client";
import { ScoringObjectSchema, type ScoringObject } from "@/lib/claude/scoring-schema";
import { ScoringWireSchema, wireToScoringObject } from "@/lib/claude/scoring-wire-schema";
import { SAMPLE_SHAPE } from "@/lib/claude/sample-shape";
import { addUsage, type TokenUsage } from "@/lib/pricing";

export class ClaudeScoringError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ClaudeScoringError";
    this.cause = cause;
  }
}

/** The params passed to client.messages.create() — the literal data sent
 * over the wire, kept for display in the Steps tab — except that `model` is
 * split into llmProviderKey/llmModelKey. (output_config is omitted here
 * since it's a fixed, non-data-dependent schema constraint, not something
 * specific to this run — the "Code" block in the Steps tab shows it.) */
export interface LlmRequestInfo {
  llmProviderKey: string;
  llmModelKey: string;
  max_tokens: number;
  /** Absent on evaluations stored before the system/user prompt split. */
  system?: string;
  messages: MessageParam[];
}

/** Claude's response is constrained to this exact shape by the API itself
 * (see requestScoringObject below) — claude-sonnet-5 doesn't support
 * assistant-turn prefill, and free-text JSON with prompt instructions alone
 * is too easy to break (markdown fences, leading prose), so this uses the
 * Messages API's native structured-outputs feature instead. Claude is asked
 * for the array-based ScoringWireSchema, not our internal record shape —
 * see scoring-wire-schema.ts for why. */
const SCORING_OBJECT_FORMAT = zodOutputFormat(ScoringWireSchema);


/** Static instructions — identical on every request, so they live in the
 * system prompt (and are cacheable). Only per-request data goes in the user
 * message; see buildUserPrompt. */
const SYSTEM_PROMPT = `You design scoring rubrics. Given a job description, you produce a rubric that will be used to evaluate a candidate's resume against it. The rubric will later be handed to a separate judgment model, one metric at a time, so every metric must be self-contained and answerable purely from resume text.

Design 3 to 12 metrics tailored to what THIS job description actually asks for — required skills, seniority, domain knowledge, and any distinguishing requirements it calls out. Do not just copy a generic list.

Each metric has:
- "key": a unique snake_case identifier for the metric.
- "type": "score" (an ordered rubric with 2-8 levels, lowest to highest), "choice" (mutually exclusive categories), or "noul" (a yes/no judgment).
- "weight": a number from 0 to 1 reflecting how important this metric is for THIS job description specifically. Weights do not need to sum to 1. At least one score or noul metric must have weight > 0, since only score/noul metrics contribute to the final numeric match score — choice metrics are descriptive/categorical only and are not weighted into it, so don't rely on a choice metric to carry importance.
- "instructions": either a plain question string, or an object {question, today} when the question is relative to today's date.
- "criteria": an ordered string array for "score", a list of {option, description} objects (at least 2 entries) for "choice", or an optional {true, false} object for "noul".

Here is a reference example — the metric keys and content below are illustrative, not a template to copy. Design your own metrics driven entirely by the job description you are given:
${SAMPLE_SHAPE}

The user message is a JSON state object with two fields: "jobDescription" (the job description to design the rubric for) and "today" (today's date, ISO format — use it if any metric needs to reason about elapsed time, e.g. years of experience). Respond with the rubric only.`;

/** Same shape as the state the app sends Jev (see buildResumeMatchState in
 * lib/jev/build-request.ts): a JSON object of just the per-request data. */
function buildUserPrompt(jobDescription: string, today: string): string {
  return JSON.stringify({ jobDescription, today }, null, 2);
}

async function requestScoringObject(client: Anthropic, messages: MessageParam[]) {
  const message = await client.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    // The breakpoint caches the whole (frozen) system prompt, so requests
    // for different job descriptions share it and only the user message is
    // billed at the full input rate. Nothing dynamic may go in here — see
    // buildUserPrompt. Note the minimum cacheable prefix on Sonnet 5 is
    // 1024 tokens; this prompt is close to it, so if you shorten it, caching
    // silently stops (cache_creation_input_tokens stays 0).
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
    output_config: { format: SCORING_OBJECT_FORMAT },
  });
  const { cache_creation_input_tokens, cache_read_input_tokens, input_tokens } = message.usage;
  console.info(
    `[claude] rubric usage: cache_write=${cache_creation_input_tokens ?? 0} cache_read=${cache_read_input_tokens ?? 0} uncached_input=${input_tokens}`,
  );
  return message;
}

/** Converts the wire response into our internal shape and applies the
 * rules that don't survive JSON Schema conversion (3-12 metrics, at least
 * one weighted score/noul metric) — see scoring-wire-schema.ts. */
function toScoringObject(wireOutput: z.infer<typeof ScoringWireSchema>) {
  return ScoringObjectSchema.safeParse(wireToScoringObject(wireOutput));
}

function mapApiError(err: APIError): ClaudeScoringError {
  if (err instanceof AuthenticationError) {
    return new ClaudeScoringError("Claude authentication failed", err);
  }
  if (err instanceof RateLimitError) {
    return new ClaudeScoringError("Claude rate limit exceeded", err);
  }
  if (err instanceof APIConnectionError) {
    return new ClaudeScoringError("Unable to reach Claude", err);
  }
  return new ClaudeScoringError(`Claude request failed: ${err.message}`, err);
}

export async function generateScoringObject(
  jobDescription: string,
): Promise<{ scoringObject: ScoringObject; request: LlmRequestInfo; usage: TokenUsage }> {
  const client = getAnthropicClient();
  const today = new Date().toISOString().slice(0, 10);
  const userPrompt = buildUserPrompt(jobDescription, today);

  const baseMessages: MessageParam[] = [{ role: "user", content: userPrompt }];
  const request: LlmRequestInfo = {
    llmProviderKey: "claude",
    llmModelKey: CLAUDE_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: baseMessages,
  };

  // Summed across the first attempt and the retry, since both are billed.
  let usage: TokenUsage = { input_tokens: 0, output_tokens: 0 };
  let firstAttemptError: string;
  try {
    const message = await requestScoringObject(client, baseMessages);
    usage = addUsage(usage, message.usage);
    if (message.parsed_output) {
      const result = toScoringObject(message.parsed_output);
      if (result.success) {
        return { scoringObject: result.data, request, usage };
      }
      firstAttemptError = z.prettifyError(result.error);
    } else {
      firstAttemptError = "Claude returned no parsable output.";
    }
  } catch (err) {
    // A real API/auth/network problem isn't fixed by asking Claude to
    // correct its JSON — the SDK already retries transient ones, so
    // surface it immediately instead of masking it as a schema miss.
    if (err instanceof APIError) throw mapApiError(err);
    firstAttemptError = err instanceof Error ? err.message : String(err);
  }

  // One retry with the validation error fed back, for a genuine schema miss.
  try {
    const retryMessage = await requestScoringObject(client, [
      ...baseMessages,
      {
        role: "user",
        content: `Your previous response didn't match the required rubric schema: ${firstAttemptError}. Please try again.`,
      },
    ]);
    usage = addUsage(usage, retryMessage.usage);
    if (retryMessage.parsed_output) {
      const result = toScoringObject(retryMessage.parsed_output);
      if (result.success) {
        return { scoringObject: result.data, request, usage };
      }
      throw new ClaudeScoringError(
        `Claude's scoring rubric failed validation twice: ${z.prettifyError(result.error)}`,
      );
    }
    throw new ClaudeScoringError("Claude's scoring rubric failed validation twice.");
  } catch (err) {
    if (err instanceof ClaudeScoringError) throw err;
    if (err instanceof APIError) throw mapApiError(err);
    throw new ClaudeScoringError(
      `Claude's scoring rubric failed validation twice: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
