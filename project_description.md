# Project Description

## What this project is

This repository is an end-to-end "agentic interface" starter kit centered on a Workshop Lead Triage experience. It is not just chat UI: the agent can fetch and update real lead data, mutate application state, render live visual components, and run multi-step workflows across three UI surfaces:

1. Embedded Next.js canvas + sidebar chat.
2. Controlled in-chat React components (cards/charts/forms).
3. External MCP App widgets that run in MCP clients like Claude or ChatGPT.

The implementation combines CopilotKit, AG-UI, A2UI-ready runtime settings, LangGraph/Deep Agents, Gemini, and MCP.

---

## Specific stack powering the generative experience

## 1) Frontend host: Next.js + React + CopilotKit React v2

- Next.js App Router + React 19 provide the main web app surface.
- `CopilotKitProvider` is configured in `apps/frontend/src/components/copilot/CopilotKitProviderShell.tsx` with:
  - `runtimeUrl: "/api/copilotkit"`
  - `openGenerativeUI: {}`
- The main triage surface in `apps/frontend/src/app/leads/page.tsx` uses:
  - `useFrontendTool(...)` for state mutators and controlled UI tools.
  - `useDefaultRenderTool(...)` as wildcard/fallback rendering.
  - `CopilotSidebar` + `CopilotChatConfigurationProvider` for interactive chat and thread context.
- `apps/frontend/next.config.ts` rewrites `/api/copilotkit/*` to the dedicated BFF runtime, keeping same-origin frontend calls and avoiding CORS complexity.

## 2) Runtime/BFF: CopilotRuntime v2 + LangGraph adapter + A2UI/open generative config

`apps/bff/src/server.ts` runs a Hono server with:

- `createCopilotEndpoint(...)`
- `CopilotRuntime(...)`
- `LangGraphAgent(...)` pointing to the Python LangGraph deployment.
- `openGenerativeUI: true`
- `a2ui: { injectA2UITool: false }`
- `mcpApps.servers[...]` registration for MCP App connectivity.

This is the bridge layer between UI, agent, and MCP tools/widgets.

## 3) Agent runtime: LangGraph + Deep Agents + CopilotKit middleware + Gemini

The Python agent entrypoint (`apps/agent/main.py`) builds a graph via `apps/agent/src/runtime.py`.

Runtime options include:

- `gemini-flash-deep` (Gemini + Deep Agents planner)
- `gemini-flash-react`
- `claude-sonnet-4-6-react`

Key implementation details:

- `CopilotKitMiddleware` enables AG-UI/CopilotKit interoperability.
- `LeadStateMiddleware` (`apps/agent/src/lead_state.py`) extends graph state for canvas fields (leads/filter/header/sync/etc.) so state snapshots preserve UI state.
- Backend lead tools (`apps/agent/src/notion_tools.py`) return `Command(update=...)` payloads to update state and messages in one turn.
- Gemini is configured through `ChatGoogleGenerativeAI` in `apps/agent/src/runtime.py`.

## 4) MCP integrations: Notion MCP + deployable mcp-use server

There are two MCP paths in this project:

1. Agent-side Notion MCP access:
   - `apps/agent/src/notion_mcp.py` wraps `@notionhq/notion-mcp-server` via `mcp-use` for read/write operations.
   - Used by `fetch_notion_leads`, `update_notion_lead`, `insert_notion_lead`, and related workflows.

2. Separate MCP App server (`apps/mcp/index.ts`):
   - Built with `mcp-use/server`.
   - Exposes tool/widget pairs:
     - `show-lead-list`
     - `show-lead-demand`
     - `show-lead-pipeline`
     - `show-canvas-dashboard`
     - `show-email-draft`
     - `post-email-comment`

This provides a portable, client-agnostic generative UI surface beyond the local app.

---

## How these frameworks enabled live dashboards, forms, and flows

## A) Live dashboards

The dashboard experience is live because agent state and React UI are directly connected:

1. Agent fetches leads (`fetch_notion_leads` in `apps/agent/src/notion_tools.py`).
2. Tool returns `Command(update={ leads, header, sync, messages })`.
3. CopilotKit/AG-UI state propagation updates frontend `agent.state`.
4. Dashboard components in `apps/frontend/src/app/leads/page.tsx` (`QuickStats`, `StatusDonut`, `WorkshopDemand`, `PipelineBoard`) re-render immediately from updated state.

Additionally, MCP widgets provide equivalent dashboards outside the app:

- `apps/mcp/resources/canvas-dashboard/widget.tsx`
- `apps/mcp/resources/lead-demand/widget.tsx`
- `apps/mcp/resources/lead-pipeline/widget.tsx`

This means the same lead insights are available both in the embedded canvas and external MCP clients.

## B) Live forms (human-in-the-loop)

The project implements HITL form workflows in two places:

1. In-app controlled form:
   - `renderEmailDraft` tool in `apps/frontend/src/app/leads/page.tsx` mounts `EmailDraftCard`.
   - User edits subject/body, then approves send.
   - Approval triggers a follow-up prompt so the agent performs `post_lead_comment` persistence.

2. MCP widget form:
   - `apps/mcp/resources/email-draft/widget.tsx` renders editable fields and a Send action.
   - Uses `useCallTool("post-email-comment")` to persist approved content through MCP tooling.

Both patterns keep the user in control before outbound actions are committed.

## C) End-to-end flows

### Flow 1: Optimistic lead edit and persistence

- Frontend tool `commitLeadEdit` applies optimistic patching and marks the card as syncing.
- Agent is prompted to persist the change via Notion write tool.
- Tool responses are observed in message tail:
  - Success keeps the edit and flashes synced state.
  - Failure rolls back from snapshot and shows an error toast.

Implementation: `apps/frontend/src/app/leads/page.tsx` + write tools in `apps/agent/src/notion_tools.py`.

### Flow 2: Stateful map interactions

- `apps/frontend/src/components/map/MapLab.tsx` registers frontend tools:
  - `mapSetMode`
  - `mapSetPrompt`
  - `mapFocusRestaurant`
- Agent can steer view mode, update prompt context, and focus map entities in a structured flow.

### Flow 3: Durable conversation threads

- `useThreads` in `apps/frontend/src/components/threads-drawer/threads-drawer.tsx` powers listing, pagination, archive/restore/delete.
- `CopilotChatConfigurationProvider` thread binding in `apps/frontend/src/app/leads/page.tsx` keeps the active chat tied to the selected thread.

This makes agentic workflows resumable, not one-shot.

---

## Where A2UI, CopilotKit, AG-UI, and MCP each fit

- CopilotKit: Frontend primitives, chat/sidebar UX, runtime transport, thread APIs.
- AG-UI: Event/state protocol layer connecting LangGraph agent execution to frontend updates.
- A2UI: Declarative generative UI compatibility in runtime configuration (`a2ui` settings), complementing controlled and open surfaces.
- MCP: Standardized tool and widget protocol for both internal data access (Notion MCP) and externally deployable UI apps (`apps/mcp`).

The result is a layered generative architecture:

1. Controlled components for predictable, brand-safe UI.
2. Declarative/open generative runtime support for long-tail interactions.
3. MCP-native widgets for portability across AI clients.

---

## Why this architecture is practical

- It is implementation-grounded, not conceptual: each framework is wired in code and exercised through concrete tools/widgets.
- It supports both local product UX and cross-client MCP UX without rebuilding core logic.
- It balances safety and flexibility with explicit controlled renderers, fallback rendering, and user-approved HITL actions.
- It is production-minded with thread persistence, sync metadata, and model/runtime guardrails in BFF and agent runtime.

In short, the stack demonstrates a full generative UI system where agent reasoning, structured tool calls, live React state, and MCP-delivered interfaces work together in one cohesive product.