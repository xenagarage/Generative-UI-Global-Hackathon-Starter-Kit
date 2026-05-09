import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  CopilotKitIntelligence,
  createCopilotEndpoint,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

const disableIntelligence = /^(1|true|yes)$/i.test(
  process.env.COPILOTKIT_DISABLE_INTELLIGENCE ?? "",
);
const intelligenceApiKey = process.env.INTELLIGENCE_API_KEY?.trim();
const hasIntelligenceConfig =
  Boolean(intelligenceApiKey) ||
  Boolean(process.env.INTELLIGENCE_API_URL) ||
  Boolean(process.env.INTELLIGENCE_GATEWAY_WS_URL) ||
  Boolean(process.env.COPILOTKIT_LICENSE_TOKEN);

const intelligenceRuntimeConfig =
  !disableIntelligence && intelligenceApiKey
  ? {
      intelligence: new CopilotKitIntelligence({
        apiKey: intelligenceApiKey,
        apiUrl: process.env.INTELLIGENCE_API_URL ?? "http://localhost:4203",
        wsUrl: process.env.INTELLIGENCE_GATEWAY_WS_URL ?? "ws://localhost:4403",
      }),
      identifyUser: () => ({ id: "default", name: "Hackathon User" }),
      licenseToken: process.env.COPILOTKIT_LICENSE_TOKEN,
    }
  : {};

if (!disableIntelligence && !hasIntelligenceConfig) {
  console.log(
    "[bff] CopilotKit Intelligence not configured; running in stateless mode.",
  );
}
if (!disableIntelligence && hasIntelligenceConfig && !intelligenceApiKey) {
  console.log(
    "[bff] INTELLIGENCE_API_KEY missing; disabling CopilotKit Intelligence " +
      "and running in stateless mode.",
  );
}
if (disableIntelligence) {
  console.log(
    "[bff] CopilotKit Intelligence disabled via COPILOTKIT_DISABLE_INTELLIGENCE.",
  );
}

const agent = new LangGraphAgent({
  deploymentUrl:
    process.env.LANGGRAPH_DEPLOYMENT_URL ?? "http://localhost:8133",
  graphId: "default",
  langsmithApiKey: process.env.LANGSMITH_API_KEY ?? "",
  // Keep turn depth conservative by default to avoid runaway tool/model loops.
  // Override with LANGGRAPH_RECURSION_LIMIT when you intentionally need deeper plans.
  assistantConfig: {
    recursion_limit: positiveIntEnv("LANGGRAPH_RECURSION_LIMIT", 20),
  },
});

const app = createCopilotEndpoint({
  basePath: "/api/copilotkit",
  runtime: new CopilotRuntime({
    ...intelligenceRuntimeConfig,
    agents: { default: agent },
    openGenerativeUI: true,
    a2ui: { injectA2UITool: false },
    mcpApps: {
      servers: [
        {
          type: "http",
          url: process.env.MCP_SERVER_URL || "http://localhost:3001/mcp",
          serverId: "manufact_local",
        },
      ],
    },
  }),
});

// Rewrite known 5xx error bodies into structured `{ error, hint, command }`
// payloads the UI can render as actionable toasts. Conservative matching —
// we only remap when we can identify the failure from the body, so unknown
// 5xx errors fall through unchanged.
app.use("*", async (c, next) => {
  await next();
  const status = c.res.status;
  if (status < 500 || status > 599) return;
  const cloned = c.res.clone();
  const ctype = cloned.headers.get("content-type") || "";
  if (!ctype.includes("json") && !ctype.includes("text")) return;
  let body: string;
  try {
    body = await cloned.text();
  } catch {
    return;
  }
  const isThreadFkey =
    body.includes("threads_user_id_fkey") ||
    (body.includes("Failed to initialize thread") &&
      body.includes("user_id"));
  if (isThreadFkey) {
    const remapped = {
      error: "Postgres user seed missing",
      hint: "Run `npm run seed` to seed the default user, then retry.",
      command: "npm run seed",
    };
    c.res = new Response(JSON.stringify(remapped), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
    return;
  }

  // AgentThreadLockedError: a prior run errored mid-stream and the LangGraph
  // SDK's per-thread lock didn't release. The thread is unrecoverable; the
  // hint tells the user to start a new conversation.
  const isThreadLocked =
    body.includes("AgentThreadLockedError") ||
    /Thread\s+[0-9a-f-]{36}\s+is locked/i.test(body);
  if (isThreadLocked) {
    const remapped = {
      error: "Thread is locked",
      hint:
        "A previous turn errored mid-stream and didn't release the run " +
        "lock. Start a new conversation (sidebar → +) to continue.",
      command: "new-thread",
    };
    c.res = new Response(JSON.stringify(remapped), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
    return;
  }
});

const port = Number(process.env.PORT) || 4010;

serve({ fetch: app.fetch, port }, () => {
  console.log(`BFF ready at http://localhost:${port}`);
});
