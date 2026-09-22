import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--muted)] text-[var(--foreground)]",
        outline: "border-[var(--border-strong)] text-[var(--foreground)]",
        accent:
          "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]",
        success:
          "border-transparent bg-[var(--success-soft)] text-[var(--success)]",
        warning:
          "border-transparent bg-[var(--warning-soft)] text-[var(--warning)]",
        danger:
          "border-transparent bg-[var(--danger-soft)] text-[var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
