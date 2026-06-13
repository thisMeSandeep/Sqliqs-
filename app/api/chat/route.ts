import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { getAdapter } from "@/lib/db";
import type { DbKind } from "@/lib/db/types";
import { createChatAgent } from "@/lib/ai/agent";

// NL → SQL → table + narrative. The connection travels per request: the
// playground sends nothing and falls back to our sample DB + default env key;
// a real project will send its own kind/connection/model (Phase 7). The server
// holds neither beyond the single request.
type ChatRequest = {
  messages: UIMessage[];
  kind?: DbKind;
  connectionString?: string;
  model?: string;
};

export async function POST(req: Request) {
  const { messages, kind, connectionString, model }: ChatRequest = await req.json();

  const dbKind = kind ?? "postgres";
  const conn = connectionString ?? process.env.DATABASE_URL!;

  const adapter = getAdapter(dbKind, conn);
  const schema = await adapter.getSchema();

  const agent = createChatAgent({ kind: dbKind, schema, adapter, model });

  return createAgentUIStreamResponse({ agent, uiMessages: messages });
}
