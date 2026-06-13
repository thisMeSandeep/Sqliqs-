import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { getAdapter } from "@/lib/db";
import type { DbKind } from "@/lib/db/types";
import type { ModelChoice } from "@/lib/ai/types";
import { createReportAgent } from "@/lib/ai/agent";

// NL → SQL → markdown report (streamed). Same per-request connection model as
// the other surfaces; playground falls back to the sample DB + default key.
type ReportRequest = {
  messages: UIMessage[];
  kind?: DbKind;
  connectionString?: string;
  model?: ModelChoice;
};

export async function POST(req: Request) {
  const { messages, kind, connectionString, model }: ReportRequest = await req.json();

  const dbKind = kind ?? "postgres";
  const conn = connectionString ?? process.env.DATABASE_URL!;

  const adapter = getAdapter(dbKind, conn);
  const schema = await adapter.getSchema();

  const agent = createReportAgent({ kind: dbKind, schema, adapter, model });

  return createAgentUIStreamResponse({ agent, uiMessages: messages });
}
