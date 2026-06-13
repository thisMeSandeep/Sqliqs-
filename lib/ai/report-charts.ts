import { z } from "zod";
import { chartConfigSchema, type ChartSpec } from "./charts";

// Reports can embed charts inline as ```chart fenced blocks containing a JSON
// ChartSpec (the chart config + its data, column-oriented). Unlike the
// Visualization surface — which uses structured output and so must dodge the
// free tier's JSON-Schema grammar limits — the report writes the block as plain
// text, so we just parse and validate it here. Self-contained data keeps reports
// a single streaming call (no second model round-trip per chart).
export const reportChartSpecSchema = chartConfigSchema.extend({
  columns: z.array(z.string()),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
});

export type ReportSegment =
  | { type: "markdown"; text: string }
  | { type: "chart"; spec: ChartSpec }
  // An opening ```chart fence whose JSON is still streaming in.
  | { type: "chart-pending" };

const CHART_FENCE = /```chart[^\n]*\n([\s\S]*?)```/g;
const CHART_OPEN = "```chart";

function parseSpec(raw: string): ChartSpec | null {
  try {
    const result = reportChartSpecSchema.safeParse(JSON.parse(raw.trim()));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Split a (possibly mid-stream) markdown report into ordered segments so the
// renderer can draw charts where the model placed them. A trailing unclosed
// fence becomes a "pending" placeholder instead of leaking raw JSON to the page.
export function parseReportSegments(markdown: string): ReportSegment[] {
  const segments: ReportSegment[] = [];
  let lastIndex = 0;
  CHART_FENCE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = CHART_FENCE.exec(markdown))) {
    const before = markdown.slice(lastIndex, match.index);
    if (before.trim()) segments.push({ type: "markdown", text: before });
    const spec = parseSpec(match[1]);
    // If the JSON is malformed, fall back to showing the block as code.
    segments.push(spec ? { type: "chart", spec } : { type: "markdown", text: match[0] });
    lastIndex = CHART_FENCE.lastIndex;
  }

  let rest = markdown.slice(lastIndex);
  const openAt = rest.indexOf(CHART_OPEN);
  if (openAt !== -1 && rest.indexOf("```", openAt + CHART_OPEN.length) === -1) {
    const beforeOpen = rest.slice(0, openAt);
    if (beforeOpen.trim()) segments.push({ type: "markdown", text: beforeOpen });
    segments.push({ type: "chart-pending" });
    rest = "";
  }
  if (rest.trim()) segments.push({ type: "markdown", text: rest });

  return segments;
}
