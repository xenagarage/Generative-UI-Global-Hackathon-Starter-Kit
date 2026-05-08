// Auto-generated tool registry types - DO NOT EDIT MANUALLY
// This file is regenerated whenever tools are added, removed, or updated during development
// Generated at: 2026-05-07T12:12:52.798Z

declare module "mcp-use/react" {
  interface ToolRegistry {
    "list-card-types": {
      input: Record<string, never>;
      output: { "cardTypes": Array<string> };
    };
    "show-canvas-card": {
      input: { "cardType": "project" | "entity" | "note" | "chart"; "name"?: string | undefined };
      output: Record<string, unknown>;
    };
  }
}

export {};
