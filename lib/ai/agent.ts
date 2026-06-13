import { generateText, InferAgentUIMessage, Output, stepCountIs, ToolLoopAgent } from "ai";
import type { DatabaseAdapter, DbKind } from "@/lib/db/types";
import { createRunQueryTool } from "./tools";
import {
  chartConfigPrompt,
  chatSystemPrompt,
  reportSystemPrompt,
  visualizeDataPrompt,
} from "./prompts";
import { chartConfigSchema, type ChartConfigSpec } from "./charts";
import { getLanguageModel } from "./providers";
import type { ModelChoice } from "./types";

type ChatAgentInput = {
  kind: DbKind;
  schema: string;
  adapter: DatabaseAdapter;
  model?: ModelChoice; // omitted ⇒ free tier (handled by getLanguageModel)
};

// The shared query agent. All three surfaces build it the same way; only the
// system prompt and the final output format differ. Here it's the Chat surface.
export function createChatAgent({ kind, schema, adapter, model }: ChatAgentInput) {
  return new ToolLoopAgent({
    model: getLanguageModel(model),
    instructions: chatSystemPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter, kind) },
    stopWhen: stepCountIs(10),
  });
}

// End-to-end type for useChat — the tool part is typed as `tool-run_query`.
export type ChatUIMessage = InferAgentUIMessage<ReturnType<typeof createChatAgent>>;

// Reports: one streaming call. Same tool-loop as chat, but the prompt asks for
// a full markdown document as the final text — no structured output needed.
export function createReportAgent({ kind, schema, adapter, model }: ChatAgentInput) {
  return new ToolLoopAgent({
    model: getLanguageModel(model),
    instructions: reportSystemPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter, kind) },
    stopWhen: stepCountIs(10),
  });
}

export type ReportUIMessage = InferAgentUIMessage<ReturnType<typeof createReportAgent>>;

// Visualization is two calls on purpose. Combining tools + structured output in
// one call makes weaker models skip the tool and emit an empty chart, so we
// split it: first gather the data (tools, no output schema → the model actually
// queries), then pick the chart config from the resulting columns (output
// schema, no tools → fast and reliable).

// Step 1: run exactly one query for the chart. The caller captures the rows via
// a wrapping adapter; this agent's text reply is ignored.
export function createVisualizeDataAgent({ kind, schema, adapter, model }: ChatAgentInput) {
  return new ToolLoopAgent({
    model: getLanguageModel(model),
    instructions: visualizeDataPrompt(kind, schema),
    tools: { run_query: createRunQueryTool(adapter, kind) },
    stopWhen: stepCountIs(6),
  });
}

// Step 2: choose the chart type and map result columns to axes.
export async function pickChartConfig(input: {
  question: string;
  columns: string[];
  sampleRows: (string | number | null)[][];
  model?: ModelChoice;
}): Promise<ChartConfigSpec> {
  const { output } = await generateText({
    model: getLanguageModel(input.model),
    output: Output.object({ schema: chartConfigSchema }),
    prompt: chartConfigPrompt(input.question, input.columns, input.sampleRows),
  });
  return output;
}
