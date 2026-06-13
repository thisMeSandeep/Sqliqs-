"use client";

import { forwardRef, useMemo } from "react";
import { Streamdown } from "streamdown";
import { ChartView } from "@/components/visualization/chart-view";
import { parseReportSegments } from "@/lib/ai/report-charts";

// The styled document. Streamdown renders the prose (the `prose` typography
// plugin styles headings, tables, lists); inline ```chart blocks are pulled out
// and drawn with the shared ChartView (Recharts). Ref is exposed so PDF export
// can read the rendered HTML — charts are SVG, so they're captured too.
export const ReportDocument = forwardRef<HTMLDivElement, { markdown: string }>(
  function ReportDocument({ markdown }, ref) {
    const segments = useMemo(() => parseReportSegments(markdown), [markdown]);

    return (
      <div ref={ref} className="prose prose-sm dark:prose-invert max-w-none">
        {segments.map((seg, i) => {
          if (seg.type === "markdown") {
            return <Streamdown key={i}>{seg.text}</Streamdown>;
          }
          if (seg.type === "chart-pending") {
            return (
              <div
                key={i}
                className="not-prose my-6 rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm"
              >
                Rendering chart…
              </div>
            );
          }
          return (
            <figure key={i} className="not-prose my-6 rounded-lg border p-4">
              {seg.spec.title && (
                <figcaption className="mb-3 text-center font-medium text-sm">
                  {seg.spec.title}
                </figcaption>
              )}
              <ChartView spec={seg.spec} chartType={seg.spec.chartType} />
            </figure>
          );
        })}
      </div>
    );
  }
);
