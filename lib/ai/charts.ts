import { z } from "zod";

// The fixed set of charts the LLM may choose from. It never draws freely — it
// picks one of these and supplies data shaped for it; we render with Recharts.
export const CHART_TYPES = ["bar", "line", "area", "pie", "scatter", "kpi", "table"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: "Bar",
  line: "Line",
  area: "Area",
  pie: "Pie / Donut",
  scatter: "Scatter",
  kpi: "KPI card",
  table: "Table",
};

// What the LLM emits — the chart *config* only. It never transcribes data:
// the model picks the chart and which result columns map to the axes, and the
// server attaches the actual rows from the run_query result. This avoids the
// model copying (and dropping or hallucinating) data, and sidesteps the
// `z.record`/`propertyNames` JSON-Schema grammar that the free tier rejects.
export const chartConfigSchema = z.object({
  chartType: z.enum(CHART_TYPES).describe("the best chart type for this result shape"),
  title: z.string().describe("a short, descriptive chart title"),
  xKey: z
    .string()
    .describe(
      "the result column used for the x-axis / categories / slice labels. For a KPI card, the column holding the metric's label."
    ),
  series: z
    .array(
      z.object({
        key: z.string().describe("a numeric result column name"),
        label: z.string().optional().describe("human-readable label for this series"),
      })
    )
    .min(1)
    .describe("the numeric result columns to plot. Pie, scatter, and KPI use exactly one."),
});

export type ChartConfigSpec = z.infer<typeof chartConfigSchema>;

// The full spec the API returns: the LLM's config + the real query result,
// column-oriented (columns + rows of values).
export type ChartSpec = ChartConfigSpec & {
  columns: string[];
  rows: (string | number | null)[][];
};

// Reconstruct row objects from the column-oriented spec for rendering.
export function toRecords(spec: ChartSpec): Record<string, unknown>[] {
  return spec.rows.map((row) =>
    Object.fromEntries(spec.columns.map((col, i) => [col, row[i]]))
  );
}
