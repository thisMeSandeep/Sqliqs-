// The seam. Everything the app needs from a user's database goes through this
// interface — the rest of the code never knows which engine it's talking to.

export type DbKind = "postgres" | "mysql" | "sqlite" | "mongodb";

export type Column = { name: string; type: string; nullable: boolean };

export type ForeignKey = {
  column: string;
  refTable: string;
  refColumn: string;
};

// Structured per-table shape — feeds the React Flow ER diagram.
export type TableInfo = {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
};

export type QueryResult = { rowCount: number; rows: unknown[] };

export interface DatabaseAdapter {
  getSchema(): Promise<string>; // plain text → LLM system prompt
  getTables(): Promise<TableInfo[]>; // structured → ER diagram
  runQuery(query: string): Promise<QueryResult>; // read-only enforced inside
}
