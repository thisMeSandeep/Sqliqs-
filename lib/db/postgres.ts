import postgres from "postgres";
import type { Column, DatabaseAdapter, ForeignKey, TableInfo } from "./types";
import { assertReadOnly, MAX_ROWS, QUERY_TIMEOUT_MS } from "./guard";

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

export function createPostgresAdapter(connectionString: string): DatabaseAdapter {
  const sql = postgres(connectionString);

  async function fetchColumns(): Promise<ColumnRow[]> {
    return sql<ColumnRow[]>`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
  }

  async function fetchForeignKeys(): Promise<ForeignKeyRow[]> {
    return sql<ForeignKeyRow[]>`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name  AS ref_table,
        ccu.column_name AS ref_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `;
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

      // Real enforcement: a READ ONLY transaction the engine itself polices,
      // plus a statement timeout. The regex guard above is the fast first line.
      const rows = await sql.begin(async (tx) => {
        await tx.unsafe("SET TRANSACTION READ ONLY");
        await tx.unsafe(`SET LOCAL statement_timeout = ${QUERY_TIMEOUT_MS}`);
        return tx.unsafe(query);
      });

      const capped = (rows as unknown[]).slice(0, MAX_ROWS);
      return { rowCount: capped.length, rows: capped };
    },
  };
}
