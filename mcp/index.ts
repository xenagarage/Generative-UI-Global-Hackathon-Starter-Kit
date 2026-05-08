import { MCPServer, object, text, widget } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "hackathon-mcp",
  title: "hackathon-mcp",
  version: "1.0.0",
  description: "Hackathon Starter Kit — Manufact MCP server",
  baseUrl: process.env.MCP_URL || "http://localhost:3001",
  favicon: "favicon.ico",
  websiteUrl: "https://mcp-use.com",
  icons: [
    {
      src: "icon.svg",
      mimeType: "image/svg+xml",
      sizes: ["512x512"],
    },
  ],
});

const cardTypeEnum = z.enum(["project", "entity", "note", "chart"]);

/**
 * TOOL THAT RETURNS A WIDGET
 * Renders a styled canvas card preview. The `widget` config tells mcp-use
 * which widget component to render; the `widget()` helper passes props.
 */
server.tool(
  {
    name: "show-canvas-card",
    description:
      "Show a styled canvas card preview for a given card type and optional name.",
    schema: z.object({
      cardType: cardTypeEnum.describe(
        "The type of canvas card to preview"
      ),
      name: z.string().optional().describe("Optional title for the card"),
    }),
    widget: {
      name: "canvas-card-preview",
      invoking: "Generating preview…",
      invoked: "Preview ready",
    },
  },
  async ({ cardType, name }) => {
    return widget({
      props: { cardType, name: name ?? "" },
      output: text(
        `Generated a ${cardType} card preview${name ? ` titled "${name}"` : ""}.`
      ),
    });
  }
);

/**
 * TOOL WITHOUT A WIDGET
 * Returns the available canvas card types as a JSON array.
 */
server.tool(
  {
    name: "list-card-types",
    description: "List the canvas card types supported by the preview tool.",
    schema: z.object({}),
    outputSchema: z.object({
      cardTypes: z.array(z.string()),
    }),
  },
  async () => {
    return object({
      cardTypes: ["project", "entity", "note", "chart"],
    });
  }
);

server.listen().then(() => {
  console.log("MCP server running on port 3001");
});
