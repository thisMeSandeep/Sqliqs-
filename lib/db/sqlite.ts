import { createClient, type Client } from "@libsql/client";
import type { Column, DatabaseAdapter, ForeignKey} from "./types";
import { assertReadOnly, MAX_ROWS } from "./guard";

// SQLite via @libsql/client — one client covers both a local `file:` URL (dev)
// and a remote `libsql://` URL (Turso, serverless-friendly). Introspection is
// PRAGMA-based rather than information_schema, but it produces the exact same
// Column[]/TableInfo[] the ER diagram and prompts consume. Read-only is enforced
// by running the query in a libsql "read" transaction plus the shared guard.ts.

// One row from PRAGMA table_info(<table>).
type TableInfoRow = { name: string; type: string; notnull: number };
// One row from PRAGMA foreign_key_list(<table>).
type FkRow = { table: string; from: string; to: string };

// A private Turso DB needs its auth token passed separately from the URL. We
// keep one "connection string" field everywhere, so accept the token folded in
// as a query param — libsql://your-db.turso.io?authToken=XXX — and split it back
// out here. Local file: URLs have no token and pass through untouched.
function parseConnection(connectionString: string): { url: string; authToken?: string } {
  // Only network URLs carry a token; leave file:./dev.db (and the like) alone.
  if (!/^(libsql|wss?|https?):/i.test(connectionString)) return { url: connectionString };
  try {
    const u = new URL(connectionString);
    const authToken = u.searchParams.get("authToken") ?? undefined;
    if (!authToken) return { url: connectionString };
    u.searchParams.delete("authToken");
    return { url: u.toString().replace(/\?$/, ""), authToken };
  } catch {
    return { url: connectionString };
  }
}

export function createSqliteAdapter(connectionString: string): DatabaseAdapter {
  const { url, authToken } = parseConnection(connectionString);
  let client: Client | null = null;
  function getClient() {
    client ??= createClient({ url, authToken });
    return client;
  }

  async function listTables(): Promise<string[]> {
    const res = await getClient().execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    return res.rows.map((r) => String(r.name));
  }

  // PRAGMA can't be parameterized; table names come from sqlite_master (our own
  // query), not user input, so interpolation is safe here.
  async function tableColumns(table: string): Promise<Column[]> {
    const res = await getClient().execute(`PRAGMA table_info("${table}")`);
    return (res.rows as unknown as TableInfoRow[]).map((c) => ({
      name: c.name,
      type: c.type || "unknown",
      nullable: c.notnull === 0,
    }));
  }

  async function tableForeignKeys(table: string): Promise<ForeignKey[]> {
    const res = await getClient().execute(`PRAGMA foreign_key_list("${table}")`);
    return (res.rows as unknown as FkRow[]).map((fk) => ({
      column: fk.from,
      refTable: fk.table,
      refColumn: fk.to,
    }));
  }

  return {
    async getSchema() {
      const tables = await listTables();
      const blocks = await Promise.all(
        tables.map(async (t) => {
          const cols = await tableColumns(t);
          const lines = cols.map(
            (c) => `  - ${c.name}: ${c.type}${c.nullable ? "" : " (not null)"}`
          );
          return `Table ${t}:\n${lines.join("\n")}`;
        })
      );
      return blocks.join("\n\n");
    },

    async getTables() {
      const tables = await listTables();
      return Promise.all(
        tables.map(async (name) => ({
          name,
          columns: await tableColumns(name),
          foreignKeys: await tableForeignKeys(name),
        }))
      );
    },

    async runQuery(query) {
      assertReadOnly(query);

      // Real enforcement: a "read" transaction the engine itself polices — a
      // write statement throws. The regex guard above is the fast first line.
      const [res] = await getClient().batch([query], "read");
      const cols = res.columns;
      const rows = res.rows
        .slice(0, MAX_ROWS)
        .map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
      return { rowCount: rows.length, rows };
    },
  };
}
