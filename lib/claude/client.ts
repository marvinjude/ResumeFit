import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Named constant so the model can be bumped in one place as new Claude
 * generations ship. CLAUDE_API_KEY is read explicitly because the SDK's
 * zero-arg constructor only auto-resolves ANTHROPIC_API_KEY, not this
 * repo's env var name.
 */
export const CLAUDE_MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.CLAUDE_API_KEY);
}

export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!isClaudeConfigured()) {
      throw new Error("CLAUDE_API_KEY is not configured on the server");
    }
    client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return client;
}
