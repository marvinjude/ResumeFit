// ---------------------------------------------------------------------------
// Jev primitives — mirrors the TypeSafe / Jev "System One" API
// (POST https://api.typesafe.ai/v1/systemone)
// ---------------------------------------------------------------------------

export type JevQuestionType = "choice" | "score" | "noul";

export interface JevChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, string>;
}

export interface JevScoreQuestion {
  type: "score";
  instructions: string;
  criteria: string[];
}

export interface JevNoulQuestion {
  type: "noul";
  instructions: string;
  criteria?: { true: string; false: string };
}

export type JevQuestion = JevChoiceQuestion | JevScoreQuestion | JevNoulQuestion;

export interface JevChoiceAnswer {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface JevScoreAnswer {
  type: "score";
  score: number;
  confidence: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
}

export interface JevNoulAnswer {
  type: "noul";
  noul: number;
}

export type JevAnswer = JevChoiceAnswer | JevScoreAnswer | JevNoulAnswer;

export interface JevDecisionRequest {
  state: Record<string, unknown>;
  model?: string;
  questions: Record<string, JevQuestion>;
}

export interface JevDecisionResponse {
  model: string;
  answers: Record<string, JevAnswer>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
