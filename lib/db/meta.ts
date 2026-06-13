import type { DbKind } from "./types";

// Display metadata for each database engine — label + icon served from
// public/databases/. Shared by the dashboard cards and the connection wizard so
// the two never drift.
export const DB_META: Record<DbKind, { label: string; icon: string }> = {
  postgres: { label: "PostgreSQL", icon: "/databases/postgresql.svg" },
  mysql: { label: "MySQL", icon: "/databases/mysql-wordmark-light.svg" },
  sqlite: { label: "SQLite", icon: "/databases/sqlite.svg" },
  mongodb: { label: "MongoDB", icon: "/databases/mongodb.svg" },
};
