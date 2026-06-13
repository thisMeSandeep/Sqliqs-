import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, InferAgentUIMessage, Output, stepCountIs, ToolLoopAgent } from "ai";
import type { DatabaseAdapter, DbKind } from "@/lib/db/types";
import { createRunQueryTool } from "./tools";
import { chartConfigPrompt, chatSystemPrompt, visualizeDataPrompt } from "./prompts";
import { chartConfigSchema, type ChartConfigSpec } from "./charts";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

function resolveModel(model?: string) {
  return openrouter(model ?? process.env.OPENROUTER_DEFAULT_MODEL ?? "openrouter/free");
}

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
    model: resolveModel(model),
    instructions: chatSystemPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter) },
    stopWhen: stepCountIs(10),
  });
}

// End-to-end type for useChat — the tool part is typed as `tool-run_query`.
export type ChatUIMessage = InferAgentUIMessage<ReturnType<typeof createChatAgent>>;

// Visualization is two calls on purpose. Combining tools + structured output in
// one call makes weaker models skip the tool and emit an empty chart, so we
// split it: first gather the data (tools, no output schema → the model actually
// queries), then pick the chart config from the resulting columns (output
// schema, no tools → fast and reliable).

// Step 1: run exactly one query for the chart. The caller captures the rows via
// a wrapping adapter; this agent's text reply is ignored.
export function createVisualizeDataAgent({ kind, schema, adapter, model }: ChatAgentInput) {
  return new ToolLoopAgent({
    model: resolveModel(model),
    instructions: visualizeDataPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter) },
    stopWhen: stepCountIs(6),
  });
}

// Step 2: choose the chart type and map result columns to axes.
export async function pickChartConfig(input: {
  question: string;
  columns: string[];
  sampleRows: (string | number | null)[][];
  model?: string;
}): Promise<ChartConfigSpec> {
  const { output } = await generateText({
    model: resolveModel(input.model),
    output: Output.object({ schema: chartConfigSchema }),
    prompt: chartConfigPrompt(input.question, input.columns, input.sampleRows),
  });
  return output;
}
