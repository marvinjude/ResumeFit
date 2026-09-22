import { z } from "zod/v4";

/**
 * Authoritative shape for the JD-derived scoring rubric Claude generates.
 * Mirrors JevQuestion (type/instructions/criteria) plus a `weight` field
 * Claude assigns per metric based on how important it is for this specific
 * job description. types/scoring.ts infers its TS types from this schema so
 * there is exactly one source of truth.
 *
 * Uses the zod/v4 import specifically because lib/claude/generate-scoring-object.ts
 * passes this schema straight into the Anthropic SDK's zodOutputFormat() helper
 * for native structured-output enforcement, which requires a zod/v4 schema object.
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

const ScoreMetricSchema = z
  .object({
    type: z.literal("score"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z.array(z.string().min(1)).min(2).max(8),
  })
  .strict();

const ChoiceMetricSchema = z
  .object({
    type: z.literal("choice"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z
      .record(z.string(), z.string().min(1))
      .refine((obj) => Object.keys(obj).length >= 2, {
        message: "choice criteria must have at least 2 options",
      }),
  })
  .strict();

const NoulMetricSchema = z
  .object({
    type: z.literal("noul"),
    weight: z.number().min(0).max(1),
    instructions: InstructionsSchema,
    criteria: z
      .object({ true: z.string().min(1), false: z.string().min(1) })
      .strict()
      .optional(),
  })
  .strict();

export const ScoringMetricSchema = z.discriminatedUnion("type", [
  ScoreMetricSchema,
  ChoiceMetricSchema,
  NoulMetricSchema,
]);

export const ScoringObjectSchema = z
  .record(z.string().regex(/^[a-z][a-z0-9_]*$/, "keys must be snake_case"), ScoringMetricSchema)
  .refine((obj) => Object.keys(obj).length >= 3 && Object.keys(obj).length <= 12, {
    message: "expected between 3 and 12 metrics",
  })
  .refine(
    (obj) =>
      Object.values(obj).some(
        (m) => (m.type === "score" || m.type === "noul") && m.weight > 0,
      ),
    { message: "at least one score or noul metric must have weight > 0" },
  );

export type ScoreMetric = z.infer<typeof ScoreMetricSchema>;
export type ChoiceMetric = z.infer<typeof ChoiceMetricSchema>;
export type NoulMetric = z.infer<typeof NoulMetricSchema>;
export type ScoringMetric = z.infer<typeof ScoringMetricSchema>;
export type ScoringObject = z.infer<typeof ScoringObjectSchema>;
