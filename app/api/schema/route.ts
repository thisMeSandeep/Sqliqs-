import { getAdapter } from "@/lib/db";
import type { DbKind } from "@/lib/db/types";

// Introspect a connected database's structure for the ER diagram. No LLM —
// just the adapter's getTables(). Connection travels per request; playground
// falls back to the sample DB.
type SchemaRequest = {
  kind?: DbKind;
  connectionString?: string;
};

export async function POST(req: Request) {
  const { kind, connectionString }: SchemaRequest = await req
    .json()
    .catch(() => ({}) as SchemaRequest);

  const dbKind = kind ?? "postgres";
  const conn = connectionString ?? process.env.DATABASE_URL!;

  try {
    const adapter = getAdapter(dbKind, conn);
    const tables = await adapter.getTables();
    return Response.json({ tables });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to read schema" },
      { status: 502 }
    );
  }
}
