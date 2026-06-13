import { tool } from "ai";
import { z } from "zod";
import type { DatabaseAdapter } from "@/lib/db/types";
import { MAX_ROWS } from "@/lib/db/guard";

// The single tool every surface shares. It's the only thing that touches the
// database, and it's bound to one adapter per request (playground sample DB
// now; a user's connection later). Read-only is enforced inside the adapter.
export function createRunQueryTool(adapter: DatabaseAdapter) {
  return tool({
    description:
      "Execute a single read-only SQL SELECT statement against the connected database and return the rows.",
    inputSchema: z.object({
      sql: z.string().describe("A single read-only SQL SELECT statement"),
    }),
    execute: async ({ sql }) => {
      const { rowCount, rows } = await adapter.runQuery(sql);
      // Tell the model when we hit the cap so it re-queries with an aggregate
      // instead of reasoning over a partial set.
      const truncated = rowCount >= MAX_ROWS;
      return { rowCount, rows, truncated };
    },
  });
}

export type RunQueryTool = ReturnType<typeof createRunQueryTool>;
