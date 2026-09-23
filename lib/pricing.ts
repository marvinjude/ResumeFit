/** Token counts for one step, in the Messages API's usage shape. The cache
 * fields are Claude-only; Jev reports plain input/output. */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** USD per million tokens. Cache writes use the 5-minute TTL rate (1.25×
 * input) since that's the TTL generate-scoring-object.ts requests; cache
 * reads are 0.1× input. */
interface ModelPricing {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  "claude-sonnet-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "jev-latest": { input: 0.042, output: 0, cacheWrite: 0, cacheRead: 0 },
};

/** Returns null when the model's pricing isn't in the table above, so the UI
 * can show tokens without inventing a price. */
export function computeCost(model: string, usage: TokenUsage): number | null {
  const price = MODEL_PRICING[model];
  if (!price) return null;
  return (
    (usage.input_tokens * price.input +
      usage.output_tokens * price.output +
      (usage.cache_creation_input_tokens ?? 0) * price.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * price.cacheRead) /
    1_000_000
  );
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens:
      (a.cache_creation_input_tokens ?? 0) +
      (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens:
      (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  };
}

// Significant digits rather than fixed decimals: a Jev call costs fractions
// of a cent, which a fixed 4-decimal format would round away.
const COST_FORMAT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});

export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  return COST_FORMAT.format(cost);
}
