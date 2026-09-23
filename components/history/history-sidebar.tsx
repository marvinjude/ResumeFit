"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  X,
} from "lucide-react";
import { archiveEvaluation } from "@/app/actions/archive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizeHandle, usePersistentSize } from "@/components/ui/resize-handle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/theme";
import type { EvaluationSummary } from "@/types/evaluation-record";

interface HistorySidebarProps {
  evaluations: EvaluationSummary[];
  theme: Theme;
}

const SIDEBAR_DEFAULT_WIDTH = 288;
const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 480;

const LINKEDIN_URL = "https://www.linkedin.com/in/jude-agboola/";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function HistorySidebar({ evaluations, theme }: HistorySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  // Below md the sidebar is an off-canvas drawer opened from a top bar;
  // `collapsed` (the icon rail) only applies from md up.
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recentOpen, setRecentOpen] = React.useState(true);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [width, setWidth] = usePersistentSize("resumefit:sidebar-width", SIDEBAR_DEFAULT_WIDTH);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return evaluations;
    return evaluations.filter(
      (e) =>
        e.jobTitleGuess.toLowerCase().includes(q) ||
        e.resumeTitleGuess.toLowerCase().includes(q),
    );
  }, [evaluations, query]);

  const archive = React.useCallback(
    async (id: string) => {
      setPendingId(id);
      try {
        await archiveEvaluation(id);
        // Archiving the open evaluation moves you on to a fresh form, the
        // same as it leaving the Recent list.
        if (pathname === `/evaluations/${id}`) router.push("/");
      } finally {
        setPendingId(null);
      }
    },
    [pathname, router],
  );

  const rail = (
    <div className="hidden h-full w-14 shrink-0 flex-col items-center gap-2 border-r border-[var(--border)] bg-[var(--muted)]/60 py-3 md:flex">
      <Link
        href="/"
        title="ResumeFit"
        className="text-2xl leading-none text-[var(--success)]"
        style={{ fontFamily: "var(--font-cursive)" }}
      >
        Fit
      </Link>
      <button
        onClick={toggleCollapsed}
        title="Expand sidebar"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>
      <Button asChild size="icon" className="h-8 w-8">
        <Link href="/" title="New evaluation">
          <Plus className="h-4 w-4" />
        </Link>
      </Button>
      <ThemeToggle initialTheme={theme} className="mt-auto" />
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Made with ❤️ by Jude Agboola — LinkedIn"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]"
      >
        <LinkedinIcon className="h-4 w-4" />
      </a>
    </div>
  );

  const drawer = (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--muted)] shadow-xl transition-[transform,visibility] duration-200",
        "md:relative md:z-auto md:h-full md:w-[var(--sidebar-w)] md:max-w-none md:shrink-0 md:translate-x-0 md:bg-[var(--muted)]/60 md:shadow-none md:transition-none",
        !mobileOpen && "max-md:invisible max-md:-translate-x-full",
        collapsed && "md:hidden",
      )}
      style={{ "--sidebar-w": `${width}px` } as React.CSSProperties}
    >
      <ResizeHandle
        label="Resize sidebar"
        value={width}
        min={SIDEBAR_MIN_WIDTH}
        max={SIDEBAR_MAX_WIDTH}
        defaultValue={SIDEBAR_DEFAULT_WIDTH}
        onChange={setWidth}
        className="hidden md:block"
      />
      <div className="flex items-center justify-between border-b border-[var(--border)] p-3">
        <Link href="/" onClick={closeMobile} className="flex min-w-0 items-center">
          <span className="truncate text-lg font-semibold tracking-tight">
            Resume
            <span
              className="text-2xl text-[var(--success)]"
              style={{ fontFamily: "var(--font-cursive)" }}
            >
              Fit
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            title="Search evaluations"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)] md:h-7 md:w-7",
              searchOpen
                ? "bg-[var(--card)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]",
            )}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={toggleCollapsed}
            title="Minimize sidebar"
            className="hidden h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)] md:flex"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <button
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)] md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="flex items-center gap-2 border-b border-[var(--border)] p-3">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search evaluations…"
            className="h-9 text-base md:h-8 md:text-xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <Link
          href="/"
          onClick={closeMobile}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card)]/70"
        >
          <Plus className="h-4 w-4" />
          New evaluation
        </Link>

        <div className="my-2 border-t border-[var(--border)]" />

        <button
          onClick={() => setRecentOpen((v) => !v)}
          aria-expanded={recentOpen}
          className="flex w-full items-center gap-1 rounded-md px-3 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", !recentOpen && "-rotate-90")}
          />
          Recent
        </button>

        {!recentOpen ? null : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-10 text-center">
            <Archive className="h-5 w-5 text-[var(--muted-foreground)]" />
            <p className="text-xs text-[var(--muted-foreground)]">
              {evaluations.length === 0 ? "No evaluations yet." : "No matches."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((evaluation) => {
              const href = `/evaluations/${evaluation.id}`;
              return (
                <HistoryItem
                  key={evaluation.id}
                  evaluation={evaluation}
                  href={href}
                  active={pathname === href}
                  pending={pendingId === evaluation.id}
                  onNavigate={closeMobile}
                  onArchive={() => archive(evaluation.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2">
        <p className="text-xs text-[var(--muted-foreground)]">
          Made with ❤️ by{" "}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[var(--foreground)] hover:underline"
          >
            Jude Agboola
            <LinkedinIcon className="h-3.5 w-3.5" />
          </a>
        </p>
        <ThemeToggle initialTheme={theme} className="shrink-0" />
      </div>
    </div>
  );

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)]/60 px-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--card)] hover:text-[var(--foreground)]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
          Resume
          <span
            className="text-2xl text-[var(--success)]"
            style={{ fontFamily: "var(--font-cursive)" }}
          >
            Fit
          </span>
        </Link>
        <Button asChild size="icon" className="h-9 w-9">
          <Link href="/" aria-label="New evaluation">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      {mobileOpen && (
        <div
          aria-hidden
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {collapsed && rail}
      {drawer}
    </>
  );
}

interface HistoryItemProps {
  evaluation: EvaluationSummary;
  href: string;
  active: boolean;
  pending: boolean;
  onNavigate: () => void;
  onArchive: () => void;
}

/** One sidebar entry. The archive button replaces the score on
 * hover or focus (always visible on touch-sized screens). */
function HistoryItem({
  evaluation,
  href,
  active,
  pending,
  onNavigate,
  onArchive,
}: HistoryItemProps) {
  return (
    <div className={cn("group relative", pending && "pointer-events-none opacity-50")}>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex flex-col gap-0.5 rounded-md px-3 py-2 pr-10 text-left transition-colors",
          active ? "bg-[var(--card)]" : "hover:bg-[var(--card)]/70",
        )}
      >
        <span className="truncate text-sm font-medium">{evaluation.jobTitleGuess}</span>
        <span className="truncate text-xs text-[var(--muted-foreground)]">
          {evaluation.resumeTitleGuess}
        </span>
      </Link>
      <span className="pointer-events-none absolute right-3 top-2 text-xs font-semibold text-[var(--muted-foreground)] group-focus-within:invisible group-hover:invisible max-md:invisible">
        {evaluation.overallScore}%
      </span>
      <button
        type="button"
        onClick={onArchive}
        aria-label="Archive evaluation"
        title="Archive"
        className="invisible absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:visible group-focus-within:visible group-hover:visible max-md:visible"
      >
        <Archive className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
