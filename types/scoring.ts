export type {
  ScoreMetric,
  ChoiceMetric,
  NoulMetric,
  ScoringMetric,
  ScoringObject,
} from "@/lib/claude/scoring-schema";

export type MetricType = "score" | "choice" | "noul";
export type MetricInstructions = string | { question: string; today: string };
