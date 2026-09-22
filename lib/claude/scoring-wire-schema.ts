import { z } from "zod/v4";

/**
 * The shape Claude actually returns via structured outputs.
 *
 * ScoringObjectSchema (a dynamic-key record) is our internal representation,
 * but the Anthropic SDK's zodOutputFormat() can't convert z.record() into a
 * usable JSON Schema — it degenerates to `{ properties: {}, additionalProperties:
 * false }`, which silently forces the model to emit an empty object no matter
 * what the prompt says. Arrays of fixed-shape objects convert cleanly, so
 * Claude is asked for `{ metrics: [{ key, type, weight, ... }] }` instead, and
 * wireToScoringObject() below converts that into our internal record shape
 * afterward. The count/weight rules that don't survive JSON Schema (3-12
 * metrics, at least one score/noul with weight > 0) are enforced by
 * ScoringObjectSchema's own refinements once the conversion is validated.
 */

const InstructionsSchema = z.union([
  z.string().min(1),
  z
    .object({
      question: z.string().min(1),
      today: z.string().min(1),
    })
    .strict(),
]);

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

const WireScoreMetric = z
  .object({
    key: z.string().regex(KEY_PATTERN),
    type: z.literal("score"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z.array(z.string().min(1)).min(2).max(8),
  })
  .strict();

const WireChoiceMetric = z
  .object({
    key: z.string().regex(KEY_PATTERN),
    type: z.literal("choice"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z
      .array(z.object({ option: z.string().min(1), description: z.string().min(1) }).strict())
      .min(2),
  })
  .strict();

const WireNoulMetric = z
  .object({
    key: z.string().regex(KEY_PATTERN),
    type: z.literal("noul"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z
      .object({ true: z.string().min(1), false: z.string().min(1) })
      .strict()
      .optional(),
  })
  .strict();

const WireMetric = z.discriminatedUnion("type", [WireScoreMetric, WireChoiceMetric, WireNoulMetric]);

export const ScoringWireSchema = z
  .object({
    metrics: z.array(WireMetric).min(3).max(12),
  })
  .strict();

export type ScoringWireOutput = z.infer<typeof ScoringWireSchema>;

/** Converts Claude's array-based wire format into our internal
 * Record<string, ScoringMetric> shape (untyped — the caller re-validates
 * with ScoringObjectSchema.safeParse(), since duplicate keys can silently
 * drop the count below the 3-metric minimum during this conversion). */
export function wireToScoringObject(wire: ScoringWireOutput): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const metric of wire.metrics) {
    const { key, ...rest } = metric;
    if (rest.type === "choice") {
      const criteria: Record<string, string> = {};
      for (const { option, description } of rest.criteria) {
        criteria[option] = description;
      }
      result[key] = { ...rest, criteria };
    } else {
      result[key] = rest;
    }
  }
  return result;
}
