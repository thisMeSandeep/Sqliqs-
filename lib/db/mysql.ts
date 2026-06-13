import mysql from "mysql2/promise";
import type { Column, DatabaseAdapter, ForeignKey, TableInfo } from "./types";
import { assertReadOnly, MAX_ROWS, QUERY_TIMEOUT_MS } from "./guard";

// MySQL / MariaDB is "just more SQL" — the same shape as postgres.ts. Schema
// comes from information_schema (scoped to the connection's database via
// DATABASE()), and read-only is enforced with a READ ONLY transaction plus the
// shared guard.ts. The result feeds the exact same Column[]/TableInfo[] the ER
// diagram and prompts already consume.

type ColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
};

type ForeignKeyRow = {
  table_name: string;
  column_name: string;
  ref_table: string;
  ref_column: string;
};

export function createMysqlAdapter(connectionString: string): DatabaseAdapter {
  // One connection per request — the adapter is built per request and the
  // surfaces issue only a handful of queries before it's discarded.
  let connPromise: Promise<mysql.Connection> | null = null;
  function getConn() {
    connPromise ??= mysql.createConnection(connectionString);
    return connPromise;
  }

  async function fetchColumns(): Promise<ColumnRow[]> {
    const conn = await getConn();
    const [rows] = await conn.query(
      `SELECT table_name AS table_name,
              column_name AS column_name,
              data_type AS data_type,
              is_nullable AS is_nullable
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
        ORDER BY table_name, ordinal_position`
    );
    return rows as ColumnRow[];
  }

  async function fetchForeignKeys(): Promise<ForeignKeyRow[]> {
    const conn = await getConn();
    const [rows] = await conn.query(
      `SELECT table_name AS table_name,
              column_name AS column_name,
              referenced_table_name AS ref_table,
              referenced_column_name AS ref_column
         FROM information_schema.key_column_usage
        WHERE table_schema = DATABASE()
          AND referenced_table_name IS NOT NULL`
    );
    return rows as ForeignKeyRow[];
  }

  return {
    async getSchema() {
      const cols = await fetchColumns();
      const byTable = new Map<string, string[]>();
      for (const c of cols) {
        const line = `  - ${c.column_name}: ${c.data_type}${c.is_nullable === "NO" ? " (not null)" : ""}`;
        const lines = byTable.get(c.table_name) ?? [];
        lines.push(line);
        byTable.set(c.table_name, lines);
      }
      return [...byTable.entries()]
        .map(([table, lines]) => `Table ${table}:\n${lines.join("\n")}`)
        .join("\n\n");
    },

    async getTables() {
      const [cols, fks] = await Promise.all([fetchColumns(), fetchForeignKeys()]);

      const tables = new Map<string, TableInfo>();
      for (const c of cols) {
        const table = tables.get(c.table_name) ?? {
          name: c.table_name,
          columns: [] as Column[],
          foreignKeys: [] as ForeignKey[],
        };
        table.columns.push({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === "YES",
        });
        tables.set(c.table_name, table);
      }

      for (const fk of fks) {
        tables.get(fk.table_name)?.foreignKeys.push({
          column: fk.column_name,
          refTable: fk.ref_table,
          refColumn: fk.ref_column,
        });
      }

      return [...tables.values()];
    },

    async runQuery(query) {
      assertReadOnly(query);

      const conn = await getConn();
      // Real enforcement: a READ ONLY transaction the engine itself polices.
      // The regex guard above is the fast first line. The statement timeout is
      // best-effort: MAX_EXECUTION_TIME is MySQL 5.7.8+ only — MariaDB has no
      // such variable, so swallow the error rather than break every query.
      try {
        await conn.query(`SET SESSION MAX_EXECUTION_TIME = ${QUERY_TIMEOUT_MS}`);
      } catch {
        // older MySQL / MariaDB — proceed without the per-statement cap.
      }
      await conn.query("START TRANSACTION READ ONLY");
      try {
        const [rows] = await conn.query(query);
        const capped = (rows as unknown[]).slice(0, MAX_ROWS);
        return { rowCount: capped.length, rows: capped };
      } finally {
        await conn.query("ROLLBACK");
      }
    },
  };
}
