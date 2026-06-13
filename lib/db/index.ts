import type { DatabaseAdapter, DbKind } from "./types";
import { createPostgresAdapter } from "./postgres";
import { createMysqlAdapter } from "./mysql";
import { createSqliteAdapter } from "./sqlite";
import { createMongoAdapter } from "./mongo";

// One tiny factory picks the engine — adding a database is one new file + one
// new case, nothing else.
export function getAdapter(kind: DbKind, connectionString: string): DatabaseAdapter {
  switch (kind) {
    case "postgres":
      return createPostgresAdapter(connectionString);
    case "mysql":
      return createMysqlAdapter(connectionString);
    case "sqlite":
      return createSqliteAdapter(connectionString);
    case "mongodb":
      return createMongoAdapter(connectionString);
    default:
      throw new Error(`Unsupported database kind: ${kind}`);
  }
}

export type { DatabaseAdapter, DbKind } from "./types";
