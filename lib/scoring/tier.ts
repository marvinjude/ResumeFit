export type ScoreTierVariant = "success" | "warning" | "danger";

export function scoreTier(score: number): { label: string; variant: ScoreTierVariant } {
  if (score >= 70) return { label: "Strong match", variant: "success" };
  if (score >= 40) return { label: "Partial match", variant: "warning" };
  return { label: "Weak match", variant: "danger" };
}

export const TIER_TEXT_CLASS: Record<ScoreTierVariant, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

export const TIER_BG_CLASS: Record<ScoreTierVariant, string> = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};
