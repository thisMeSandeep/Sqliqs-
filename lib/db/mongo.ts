import { MongoClient, type Document, type Sort } from "mongodb";
import type { Column, DatabaseAdapter, TableInfo } from "./types";
import { MAX_ROWS } from "./guard";

// MongoDB is the one genuine divergence (ARCHITECTURE §9.3) and it's fully
// contained here — no new routes, agents, or prompt files. Three things differ
// from the SQL adapters, all inside this file:
//   1. Schema is inferred by SAMPLING documents per collection (no DDL/catalog).
//   2. runQuery takes a JSON operation (aggregation pipeline or find), not SQL.
//   3. Read-only is its own check (find/aggregate only, no $out/$merge), so it
//      does NOT use the SQL guard.ts.
// Collections have no foreign keys, so getTables() returns inferred fields with
// foreignKeys: [] — the ER diagram renders collection nodes with no edges.

// How many documents to sample per collection when inferring its shape.
const SAMPLE_SIZE = 50;

// Parsed shape of the JSON the model puts in run_query's `query` argument.
type MongoOp = {
  collection: string;
  pipeline?: unknown[];
  filter?: Record<string, unknown>;
  projection?: Record<string, unknown>;
  sort?: Record<string, unknown>;
  limit?: number;
};

// Aggregation stages that write — blocked so the connection stays read-only.
const WRITE_STAGES = new Set(["$out", "$merge"]);

function inferType(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  // ObjectId and other BSON types carry a _bsontype tag.
  if (typeof value === "object" && "_bsontype" in (value as object)) {
    return String((value as { _bsontype: unknown })._bsontype).toLowerCase();
  }
  return typeof value;
}

export function createMongoAdapter(connectionString: string): DatabaseAdapter {
  let connPromise: Promise<MongoClient> | null = null;
  function getClient() {
    connPromise ??= new MongoClient(connectionString).connect();
    return connPromise;
  }

  async function getDb() {
    const client = await getClient();
    // The database is taken from the connection string (mongodb+srv://…/db).
    return client.db();
  }

  // Sample documents from one collection and union their top-level fields.
  async function sampleCollection(name: string): Promise<Column[]> {
    const db = await getDb();
    const docs = await db
      .collection(name)
      .aggregate([{ $sample: { size: SAMPLE_SIZE } }])
      .toArray();

    // field → observed types (so a polymorphic field reads "string|null") and a
    // presence count (a field missing from some sampled docs is nullable).
    const fields = new Map<string, { types: Set<string>; seen: number }>();
    for (const doc of docs) {
      for (const [key, value] of Object.entries(doc)) {
        const entry = fields.get(key) ?? { types: new Set<string>(), seen: 0 };
        entry.types.add(inferType(value));
        entry.seen += 1;
        fields.set(key, entry);
      }
    }
    return [...fields.entries()].map(([name, { types, seen }]) => ({
      name,
      type: [...types].join("|"),
      nullable: types.has("null") || seen < docs.length,
    }));
  }

  async function listCollections(): Promise<string[]> {
    const db = await getDb();
    const infos = await db.listCollections({}, { nameOnly: true }).toArray();
    return infos.map((i) => i.name).sort();
  }

  return {
    async getSchema() {
      const names = await listCollections();
      const blocks = await Promise.all(
        names.map(async (name) => {
          const cols = await sampleCollection(name);
          const lines = cols.map((c) => `  - ${c.name}: ${c.type}`);
          return `Collection ${name}:\n${lines.join("\n")}`;
        })
      );
      return blocks.join("\n\n");
    },

    async getTables(): Promise<TableInfo[]> {
      const names = await listCollections();
      return Promise.all(
        names.map(async (name) => ({
          name,
          columns: await sampleCollection(name),
          foreignKeys: [], // Mongo has no FKs; reference inference is out of scope.
        }))
      );
    },

    async runQuery(query) {
      const op = parseOp(query);
      const db = await getDb();
      const coll = db.collection(op.collection);

      let rows: unknown[];
      if (op.pipeline) {
        assertReadOnlyPipeline(op.pipeline);
        rows = await coll
          .aggregate(op.pipeline as Document[])
          .limit(MAX_ROWS)
          .toArray();
      } else {
        rows = await coll
          .find(op.filter ?? {}, { projection: op.projection, sort: op.sort as Sort })
          .limit(Math.min(op.limit ?? MAX_ROWS, MAX_ROWS))
          .toArray();
      }

      const capped = rows.slice(0, MAX_ROWS);
      return { rowCount: capped.length, rows: capped };
    },
  };
}

// Parse the model's JSON operation and reject anything that isn't a read.
function parseOp(query: string): MongoOp {
  let parsed: unknown;
  try {
    parsed = JSON.parse(query);
  } catch {
    throw new Error(
      'Query must be JSON: {"collection":"…","pipeline":[…]} or {"collection":"…","filter":{…}}'
    );
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Query must be a JSON object with a `collection`");
  }
  const op = parsed as MongoOp;
  if (!op.collection || typeof op.collection !== "string") {
    throw new Error("Query must name a `collection`");
  }
  if (op.pipeline !== undefined && !Array.isArray(op.pipeline)) {
    throw new Error("`pipeline` must be an array of aggregation stages");
  }
  return op;
}

function assertReadOnlyPipeline(pipeline: unknown[]): void {
  for (const stage of pipeline) {
    if (stage && typeof stage === "object") {
      for (const key of Object.keys(stage)) {
        if (WRITE_STAGES.has(key)) {
          throw new Error(`Stage ${key} writes data and is not allowed (read-only)`);
        }
      }
    }
  }
}
