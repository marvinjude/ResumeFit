"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SamplePicker } from "@/components/evaluate/sample-picker";
import { SAMPLE_JOB_DESCRIPTIONS } from "@/lib/samples/sample-jds";
import { SAMPLE_RESUMES } from "@/lib/samples/sample-resumes";
import { MAX_TEXT_LENGTH } from "@/lib/config";

interface JdResumeFormProps {
  jobDescription: string;
  resume: string;
  onJobDescriptionChange: (value: string) => void;
  onResumeChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  claudeConfigured: boolean | null;
  hasResult: boolean;
}

export function JdResumeForm({
  jobDescription,
  resume,
  onJobDescriptionChange,
  onResumeChange,
  onSubmit,
  submitting,
  claudeConfigured,
  hasResult,
}: JdResumeFormProps) {
  const canSubmit =
    jobDescription.trim().length > 0 &&
    resume.trim().length > 0 &&
    !submitting &&
    claudeConfigured !== false;

  return (
    <div className="flex h-full flex-col gap-6 lg:min-h-[480px]">
      <div className="flex flex-1 flex-col gap-1.5 lg:min-h-0">
        <div className="flex items-center justify-between">
          <Label htmlFor="job-description">Job description</Label>
          <SamplePicker
            label="Use sample"
            samples={SAMPLE_JOB_DESCRIPTIONS}
            onSelect={onJobDescriptionChange}
            disabled={submitting}
          />
        </div>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here, or click Use sample to try one…"
          maxLength={MAX_TEXT_LENGTH}
          disabled={submitting}
          className="min-h-56 flex-1 resize-none font-mono text-base leading-relaxed md:text-xs lg:min-h-0"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 lg:min-h-0">
        <div className="flex items-center justify-between">
          <Label htmlFor="resume">Resume</Label>
          <SamplePicker
            label="Use sample"
            samples={SAMPLE_RESUMES}
            onSelect={onResumeChange}
            disabled={submitting}
          />
        </div>
        <Textarea
          id="resume"
          value={resume}
          onChange={(e) => onResumeChange(e.target.value)}
          placeholder="Paste the candidate's resume here, or click Use sample to try one…"
          maxLength={MAX_TEXT_LENGTH}
          disabled={submitting}
          className="min-h-56 flex-1 resize-none font-mono text-base leading-relaxed md:text-xs lg:min-h-0"
        />
      </div>

      {claudeConfigured === false && (
        <p className="shrink-0 text-xs text-[var(--danger)]">
          CLAUDE_API_KEY is not configured on the server, so a scoring rubric
          can&apos;t be generated. Set it in .env and restart the server.
        </p>
      )}

      <div className="flex shrink-0 justify-end">
        <Button onClick={onSubmit} disabled={!canSubmit} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {submitting ? "Evaluating…" : hasResult ? "Re-evaluate" : "Evaluate"}
        </Button>
      </div>
    </div>
  );
}
