"use client";

import { useEffect } from "react";
import { Mail, Phone, MessageSquare, X } from "lucide-react";
import type { Lead, Segment } from "@/lib/leads/types";
import { STATUSES, TECH_LEVELS, WORKSHOPS } from "@/lib/leads/types";
import {
  initials,
  techLevelClass,
  workshopClass,
  segmentDotClass,
} from "@/lib/leads/derive";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NotionLink } from "./LeadCard";

interface LeadDetailProps {
  lead: Lead | null;
  segments: Segment[];
  onClose: () => void;
  /**
   * Phase 04: called when the user edits an in-panel control. The page-
   * level handler in `app/page.tsx` is responsible for applying the
   * optimistic patch, kicking off the Notion write through the agent's
   * `update_notion_lead` tool, and rolling back on failure.
   */
  onEdit?: (leadId: string, patch: Partial<Lead>) => void;
  /** Phase 04: a write is currently in flight for this lead. */
  syncing?: boolean;
}

export function LeadDetail({
  lead,
  segments,
  onClose,
  onEdit,
  syncing,
}: LeadDetailProps) {
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  const memberOf = segments.filter((s) => s.leadIds.includes(lead.id));

  return (
    <aside className="fixed inset-y-0 right-[420px] z-30 flex w-[380px] max-w-[90vw] flex-col border-l border-border bg-background shadow-xl">
      <header className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={lead.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{lead.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {lead.role}
              {lead.company ? ` @ ${lead.company}` : null}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <section className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${workshopClass(
                lead.workshop,
              )}`}
            >
              {lead.workshop}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${techLevelClass(
                lead.technical_level,
              )}`}
            >
              {lead.technical_level}
            </span>
            {lead.opt_in ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-300">
                opted in
              </span>
            ) : null}
            {lead.source ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                via {lead.source}
              </span>
            ) : null}
          </section>

          {onEdit ? (
            <section
              data-syncing={syncing ? "true" : undefined}
              className="relative space-y-3 rounded-md border border-border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick edit
                </h3>
                <span className="text-[10px] text-muted-foreground/70">
                  syncs to Notion
                </span>
              </div>
              <EditRow label="Status">
                <Select
                  value={lead.status || undefined}
                  onValueChange={(v) => onEdit(lead.id, { status: v })}
                  disabled={syncing}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Pick a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
              <EditRow label="Workshop">
                <Select
                  value={lead.workshop}
                  onValueChange={(v) => onEdit(lead.id, { workshop: v })}
                  disabled={syncing}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Pick a workshop" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKSHOPS.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
              <EditRow label="Technical level">
                <Select
                  value={lead.technical_level || undefined}
                  onValueChange={(v) =>
                    onEdit(lead.id, { technical_level: v })
                  }
                  disabled={syncing}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Pick a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_LEVELS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
              <EditRow label="Opt-in to updates">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={lead.opt_in}
                    onCheckedChange={(v) =>
                      onEdit(lead.id, { opt_in: Boolean(v) })
                    }
                    disabled={syncing}
                    aria-label="Toggle opt-in"
                  />
                  <span className="text-xs text-muted-foreground">
                    {lead.opt_in ? "Opted in" : "Not opted in"}
                  </span>
                </div>
              </EditRow>
            </section>
          ) : null}

          <section className="space-y-2 text-sm">
            <DetailRow icon={Mail} label="Email">
              <a
                href={`mailto:${lead.email}`}
                className="text-foreground underline-offset-2 hover:underline"
              >
                {lead.email}
              </a>
            </DetailRow>
            {lead.phone ? (
              <DetailRow icon={Phone} label="Phone">
                {lead.phone}
              </DetailRow>
            ) : null}
            {lead.submitted_at ? (
              <DetailRow label="Submitted">
                {formatTimestamp(lead.submitted_at)}
              </DetailRow>
            ) : null}
          </section>

          {lead.tools.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tools they use
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.tools.map((t) => (
                  <span
                    key={t}
                    className={`rounded-md bg-muted px-2 py-1 text-xs ${
                      t === "CopilotKit"
                        ? "ring-1 ring-primary/40 text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {lead.interested_in.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Interested in
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.interested_in.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {lead.message ? (
            <section>
              <h3 className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MessageSquare className="size-3" /> Message
              </h3>
              <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                {lead.message}
              </p>
            </section>
          ) : null}

          {memberOf.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Segments
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {memberOf.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs text-foreground"
                  >
                    <span
                      className={`size-1.5 rounded-full ${segmentDotClass(s.color)}`}
                    />
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border p-3">
        <NotionLink url={lead.url} />
        <a
          href={`mailto:${lead.email}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Mail className="size-3.5" /> Compose email
        </a>
      </footer>
    </aside>
  );
}

function Avatar({ name }: { name: string }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return (
    <div
      className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
      style={{ background: `hsl(${hue} 45% 50%)` }}
    >
      {initials(name)}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex w-24 shrink-0 items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="size-3" /> : null}
        <span>{label}</span>
      </div>
      <div className="min-w-0 flex-1 truncate text-sm text-foreground">
        {children}
      </div>
    </div>
  );
}

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
