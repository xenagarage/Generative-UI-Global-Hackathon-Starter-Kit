import { useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import { z } from "zod";

export const propSchema = z.object({
  cardType: z
    .enum(["project", "entity", "note", "chart"])
    .describe("The canvas card type"),
  name: z.string().describe("Optional card title"),
});

export type CanvasCardPreviewProps = z.infer<typeof propSchema>;

export const widgetMetadata: WidgetMetadata = {
  description:
    "Render a styled canvas card preview with a per-type color and the card's name.",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Generating preview…",
    invoked: "Preview ready",
  },
};

const cardStyles: Record<
  CanvasCardPreviewProps["cardType"],
  { bg: string; accent: string; emoji: string; label: string }
> = {
  project: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    accent: "text-blue-700 dark:text-blue-200",
    emoji: "📋",
    label: "Project",
  },
  entity: {
    bg: "bg-green-100 dark:bg-green-900/40",
    accent: "text-green-700 dark:text-green-200",
    emoji: "🧩",
    label: "Entity",
  },
  note: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    accent: "text-yellow-700 dark:text-yellow-200",
    emoji: "📝",
    label: "Note",
  },
  chart: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    accent: "text-purple-700 dark:text-purple-200",
    emoji: "📊",
    label: "Chart",
  },
};

const CanvasCardPreview: React.FC = () => {
  const { props } = useWidget<CanvasCardPreviewProps>();
  const cardType = props?.cardType ?? "project";
  const name = props?.name?.trim() || `Untitled ${cardStyles[cardType].label}`;
  const style = cardStyles[cardType];

  return (
    <div className="p-6 w-full">
      <div
        className={`rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-6 ${style.bg}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl" aria-hidden>
            {style.emoji}
          </span>
          <span
            className={`text-xs uppercase tracking-wider font-semibold ${style.accent}`}
          >
            {style.label}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          {name}
        </h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          A {style.label.toLowerCase()} card preview rendered by the
          hackathon-mcp server.
        </p>
      </div>
    </div>
  );
};

export default CanvasCardPreview;
