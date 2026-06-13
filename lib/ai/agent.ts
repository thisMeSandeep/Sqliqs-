import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";
import type { DatabaseAdapter, DbKind } from "@/lib/db/types";
import { createRunQueryTool } from "./tools";
import { chatSystemPrompt } from "./prompts";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

type ChatAgentInput = {
  kind: DbKind;
  schema: string;
  adapter: DatabaseAdapter;
  model?: string;
};

// The shared query agent. All three surfaces build it the same way; only the
// system prompt and the final output format differ. Here it's the Chat surface.
export function createChatAgent({ kind, schema, adapter, model }: ChatAgentInput) {
  return new ToolLoopAgent({
    model: openrouter(model ?? process.env.OPENROUTER_DEFAULT_MODEL ?? "openrouter/free"),
    instructions: chatSystemPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter) },
    stopWhen: stepCountIs(10),
  });
}

// End-to-end type for useChat — the tool part is typed as `tool-run_query`.
export type ChatUIMessage = InferAgentUIMessage<ReturnType<typeof createChatAgent>>;
