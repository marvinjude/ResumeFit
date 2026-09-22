"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

const ORDER: Theme[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon };
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// The <html> class is the source of truth: the server renders it from the
// cookie, and every toggle instance reads and writes it here.
const listeners = new Set<() => void>();

function getTheme(): Theme {
  const { classList } = document.documentElement;
  return classList.contains("dark")
    ? "dark"
    : classList.contains("light")
      ? "light"
      : "system";
}

function setTheme(theme: Theme) {
  const { classList } = document.documentElement;
  classList.remove("light", "dark");
  if (theme === "system") {
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0`;
  } else {
    classList.add(theme);
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function ThemeToggle({
  initialTheme,
  className,
}: {
  initialTheme: Theme;
  className?: string;
}) {
  const theme = React.useSyncExternalStore(subscribe, getTheme, () => initialTheme);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = ICONS[theme];
  const label = `Theme: ${theme} (switch to ${next})`;

  return (
    <button
      onClick={() => setTheme(next)}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
