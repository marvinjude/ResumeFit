"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A size that survives reloads via localStorage. Starts at `defaultSize` on
 * the server and first render (so hydration matches), then restores the
 * saved value.
 */
export function usePersistentSize(storageKey: string, defaultSize: number) {
  const [size, setSize] = React.useState(defaultSize);

  React.useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring after hydration
      if (saved) setSize(saved);
    } catch {
      // Storage unavailable (private mode etc.) — keep the default.
    }
  }, [storageKey]);

  const update = React.useCallback(
    (next: number) => {
      setSize(next);
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // Ignore — the size just won't persist.
      }
    },
    [storageKey],
  );

  return [size, update] as const;
}

interface ResizeHandleProps {
  /** Current size, in whatever unit the parent uses (px or %). */
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  /** Converts a horizontal pointer movement in px into the parent's unit. */
  pxToUnit?: (px: number) => number;
  label: string;
  className?: string;
}

/**
 * Vertical drag handle for resizing the pane to its left. Drag with the
 * pointer, nudge with the arrow keys, or double-click to reset.
 */
export function ResizeHandle({
  value,
  min,
  max,
  defaultValue,
  onChange,
  pxToUnit = (px) => px,
  label,
  className,
}: ResizeHandleProps) {
  const [dragging, setDragging] = React.useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = value;
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => onChange(clamp(startValue + pxToUnit(ev.clientX - startX)));
    const onUp = () => {
      setDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = pxToUnit(e.shiftKey ? 48 : 16);
    if (e.key === "ArrowLeft") onChange(clamp(value - step));
    else if (e.key === "ArrowRight") onChange(clamp(value + step));
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => onChange(defaultValue)}
      className={cn(
        "group absolute inset-y-0 -right-1.5 z-20 w-3 cursor-col-resize touch-none outline-none",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto h-full w-0.5 transition-colors",
          dragging
            ? "bg-[var(--accent)]"
            : "bg-transparent group-hover:bg-[var(--accent)]/60 group-focus-visible:bg-[var(--accent)]",
        )}
      />
    </div>
  );
}
