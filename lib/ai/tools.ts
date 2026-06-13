import { tool } from "ai";
import { z } from "zod";
import type { DatabaseAdapter, DbKind } from "@/lib/db/types";
import { MAX_ROWS } from "@/lib/db/guard";

// The single tool every surface shares. It's the only thing that touches the
// database, and it's bound to one adapter per request (playground sample DB
// now; a user's connection later). Read-only is enforced inside the adapter.
//
// The input is a generic `query` string, not `sql`: SQL engines put a SELECT
// here, MongoDB puts an aggregation/find as JSON. The adapter parses and
// executes it — the tool stays engine-agnostic (ARCHITECTURE §9.3).
export function createRunQueryTool(adapter: DatabaseAdapter, kind: DbKind) {
  const isMongo = kind === "mongodb";
  return tool({
    description: isMongo
      ? "Execute a single read-only MongoDB operation (aggregation pipeline or find, as JSON) against the connected database and return the documents."
      : "Execute a single read-only SQL SELECT statement against the connected database and return the rows.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          isMongo
            ? "A single read-only MongoDB operation expressed as JSON (aggregation pipeline or find)"
            : "A single read-only SQL SELECT statement"
        ),
    }),
    execute: async ({ query }) => {
      const { rowCount, rows } = await adapter.runQuery(query);
      // Tell the model when we hit the cap so it re-queries with an aggregate
      // instead of reasoning over a partial set.
      const truncated = rowCount >= MAX_ROWS;
      return { rowCount, rows, truncated };
    },
  });
}

export type RunQueryTool = ReturnType<typeof createRunQueryTool>;
