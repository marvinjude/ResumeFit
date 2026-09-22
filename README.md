# ResumeFit

ResumeFit scores a candidate's resume against a job description. Claude
reads the job description and designs a tailored scoring rubric; [Jev](https://docs.typesafe.ai)
judges the resume against that rubric with calibrated, bounded answers;
application code combines those answers into one transparent, weighted
match score.

## How it works

1. **Job description.** Paste a JD (or load a sample) in the left pane.
2. **Rubric generation.** The JD is sent to Claude, which designs 3–12
   metrics tailored to what this specific role asks for — each with a
   type (`score`, `choice`, or `noul`), a question, and an importance
   weight. Nothing is fixed or hardcoded per-role.
3. **Resume.** Paste a resume (or load a sample) alongside the JD.
4. **Jev evaluates.** The rubric and resume are handed to Jev in one call.
   Jev answers each metric independently — yes/no judgments and ordered
   scores with calibrated probabilities — never a single opaque "overall
   score."
5. **Weighted score.** ResumeFit combines Jev's per-metric answers using
   Claude's assigned weights into one 0–100 match score
   (`lib/scoring/compute-score.ts`). Categorical (`choice`) metrics are
   shown for context but excluded from the score — they aren't inherently
   good or bad.
6. **Inspect and revisit.** Every metric card shows its resolved value and
   weight, and "View raw answer" opens Jev's full probability breakdown.
   Every run is saved to MongoDB under an anonymous session and browsable
   from History.

## Setup

```bash
npm install
cp .env.example .env
# put your Jev + Claude API keys in .env
docker compose up -d   # starts MongoDB on localhost:27017
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If `JEV_API_KEY` isn't set, ResumeFit runs Jev calls in **Demo Mode**: a
deterministic fixture generator (`lib/jev/simulate.ts`) stands in for Jev
so the rest of the flow still works end to end. Every simulated result is
labeled as such in the UI. `CLAUDE_API_KEY` has no fallback — it's
required to generate a scoring rubric at all.

