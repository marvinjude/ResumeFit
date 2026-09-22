import "server-only";
import type { JevDecisionRequest, JevDecisionResponse } from "@/types/evaluation";

/**
 * Server-side client for the Jev "System One" decision model.
 * https://docs.typesafe.ai — POST /v1/systemone
 *
 * JEV_API_KEY must never be exposed to the browser: this module is only
 * ever imported from Route Handlers / server code (enforced by the
 * "server-only" import above).
 */
const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const JEV_MODEL = "jev-latest";
const REQUEST_TIMEOUT_MS = 20000;

export class JevClientError extends Error {
  status?: number;
  cause?: unknown;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = "JevClientError";
    this.status = status;
    this.cause = cause;
  }
}

export function isJevConfigured(): boolean {
  return Boolean(process.env.JEV_API_KEY);
}

export async function callJev(
  request: JevDecisionRequest,
): Promise<JevDecisionResponse> {
  const apiKey = process.env.JEV_API_KEY;
  if (!apiKey) {
    throw new JevClientError("JEV_API_KEY is not configured on the server");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(JEV_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: JEV_MODEL, ...request }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new JevClientError("Jev rate limit exceeded", 429);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new JevClientError(
        `Jev request failed with status ${res.status}`,
        res.status,
        body,
      );
    }

    const data = (await res.json()) as JevDecisionResponse;
    if (!data || typeof data !== "object" || !data.answers) {
      throw new JevClientError("Jev returned a malformed response");
    }
    return data;
  } catch (err) {
    if (err instanceof JevClientError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new JevClientError("Jev request timed out");
    }
    throw new JevClientError("Jev request failed", undefined, err);
  } finally {
    clearTimeout(timeout);
  }
}
