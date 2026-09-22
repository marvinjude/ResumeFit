/**
 * Reference example embedded in the rubric-generation prompt, showing
 * Claude the JSON shape only — not server-only, since it's also reused to
 * highlight this section of the prompt in the Steps tab (a client component).
 */
export const SAMPLE_SHAPE = `{
  "metrics": [
    {
      "key": "years_of_experience",
      "type": "score",
      "weight": 0.7,
      "instructions": { "question": "How many years of professional experience does the candidate have, as of today?", "today": "2026-09-15" },
      "criteria": ["None", "2 years", "4 years", "6 years", "8 years", "10+ years"]
    },
    {
      "key": "llm_experience",
      "type": "noul",
      "weight": 0.5,
      "instructions": "Does the candidate have experience developing LLM products?",
      "criteria": { "true": "Built products or features powered by AI or LLMs", "false": "No evidence of building AI products" }
    },
    {
      "key": "career_progression",
      "type": "choice",
      "weight": 0.2,
      "instructions": "What type of career progression is shown?",
      "criteria": [
        { "option": "steady_growth", "description": "Clear progression with increasing seniority" },
        { "option": "lateral_moves", "description": "Similar roles at different companies" },
        { "option": "job_hopping", "description": "Frequent changes with short tenure" },
        { "option": "unclear", "description": "Progression pattern is unclear" }
      ]
    }
  ]
}`;
