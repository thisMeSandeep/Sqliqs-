import type { DatabaseAdapter, DbKind } from "./types";
import { createPostgresAdapter } from "./postgres";

// One tiny factory picks the engine. MySQL / SQLite / MongoDB land here in
// Phase 8 — adding a database is one new file + one new case, nothing else.
export function getAdapter(kind: DbKind, connectionString: string): DatabaseAdapter {
  switch (kind) {
    case "postgres":
      return createPostgresAdapter(connectionString);
    default:
      throw new Error(`Unsupported database kind: ${kind}`);
  }
}

export type { DatabaseAdapter, DbKind } from "./types";
