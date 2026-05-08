"use client";

import { Activity, Sparkles } from "lucide-react";

// Phase 05: pre-baked prompts surfaced as chips on the empty canvas. Stacked
// in a 2-column grid so the layout stays compact even on the smallest viewport
// the canvas is meant to fill. Order matches the natural onboarding journey:
//   1. import         (the only thing a fresh canvas can do)
//   2. summarize      (no-op until import lands; harmless before)
//   3. segment        (uses addSegment + filter — exercises the segment path)
//   4. sample edit    (phase 04 follow-up: walks the user through one edit
//                      end-to-end so they see the optimistic UI + Notion
//                      round-trip)
const PROMPTS: Array<{ label: string; prompt: string }> = [
  {
    label: "Import the workshop leads.",
    prompt: "Import the workshop leads.",
  },
  {
    label: "Show demand by workshop.",
    prompt: "Show demand by workshop.",
  },
  {
    label: "Tag the advanced/expert leads as Cohort A.",
    prompt:
      "Tag the advanced/expert leads as a segment called \"Cohort A\" and filter the canvas to just that group.",
  },
  {
    label: "Try a sample edit (end-to-end).",
    prompt:
      "Walk me through editing one lead end-to-end. Pick any lead, change their workshop to 'Deploying Agents (prod)', and confirm the change persisted in Notion.",
  },
];

const HEALTH_CHECK_PROMPT =
  "Run notion_health_check and tell me the result.";

interface EmptyStateProps {
  onPromptClick?: (prompt: string) => void;
}

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card/40 p-12">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          No leads loaded yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drive the canvas from the chat panel on the right. The agent will
          read from your connected Notion database and populate this view.
        </p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => onPromptClick?.(HEALTH_CHECK_PROMPT)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
          >
            <Activity className="size-3" />
            Ping Notion DB
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
          {PROMPTS.map((p) => (
            <li key={p.label}>
              <button
                type="button"
                onClick={() => onPromptClick?.(p.prompt)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
              >
                <span className="text-muted-foreground/60">›</span> {p.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
