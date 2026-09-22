"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SampleOption {
  id: string;
  title: string;
  text: string;
}

interface SamplePickerProps {
  label: string;
  samples: SampleOption[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SamplePicker({ label, samples, onSelect, disabled }: SamplePickerProps) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(id) => {
        const sample = samples.find((s) => s.id === id);
        if (sample) onSelect(sample.text);
      }}
    >
      <SelectTrigger className="h-9 w-auto gap-1.5 md:h-7 rounded-md border border-[var(--border)] bg-transparent px-2.5 text-xs text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:ring-0">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {samples.map((sample) => (
          <SelectItem key={sample.id} value={sample.id}>
            {sample.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
