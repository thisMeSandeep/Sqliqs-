import { getAdapter } from "@/lib/db";
import type { DatabaseAdapter, DbKind } from "@/lib/db/types";
import { createVisualizeDataAgent, pickChartConfig } from "@/lib/ai/agent";
import type { ChartSpec } from "@/lib/ai/charts";

// NL → SQL → {chartType, data}. The agent picks the chart config; the data is
// captured straight from its run_query result (the model never transcribes
// rows). Connection travels per request (playground → sample DB).
type VisualizeRequest = {
  prompt: string;
  kind?: DbKind;
  connectionString?: string;
  model?: string;
};

export async function POST(req: Request) {
  const { prompt, kind, connectionString, model }: VisualizeRequest = await req.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "Empty prompt" }, { status: 400 });
  }

  const dbKind = kind ?? "postgres";
  const conn = connectionString ?? process.env.DATABASE_URL!;
  const adapter = getAdapter(dbKind, conn);
  const schema = await adapter.getSchema();

  // Capture the result of the agent's final query — that's the chart's data.
  let captured: { columns: string[]; rows: (string | number | null)[][] } = {
    columns: [],
    rows: [],
  };
  const capturing: DatabaseAdapter = {
    getSchema: () => adapter.getSchema(),
    getTables: () => adapter.getTables(),
    async runQuery(query) {
      const result = await adapter.runQuery(query);
      if (result.rows.length > 0) {
        const columns = Object.keys(result.rows[0] as Record<string, unknown>);
        captured = {
          columns,
          rows: result.rows.map((row) =>
            columns.map((c) => (row as Record<string, string | number | null>)[c] ?? null)
          ),
        };
      }
      return result;
    },
  };

  try {
    // Step 1: the agent runs one query; we capture its rows above.
    const dataAgent = createVisualizeDataAgent({ kind: dbKind, schema, adapter: capturing, model });
    await dataAgent.generate({ prompt });

    if (captured.rows.length === 0) {
      return Response.json(
        { error: "Couldn't get data to chart. Try rephrasing, or ask about this database." },
        { status: 422 }
      );
    }

    // Step 2: pick the chart config from the captured columns + a few rows.
    const config = await pickChartConfig({
      question: prompt,
      columns: captured.columns,
      sampleRows: captured.rows,
      model,
    });

    const spec: ChartSpec = { ...config, ...captured };
    return Response.json(spec);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to generate chart" },
      { status: 502 }
    );
  }
}
