"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ResultTable } from "@/components/chat/result-table";
import { toRecords, type ChartSpec, type ChartType } from "@/lib/ai/charts";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// The LLM (and Postgres) may hand numbers back as strings — coerce series
// values so Recharts plots them. Non-numeric x labels are left as-is.
function normalize(spec: ChartSpec): Record<string, unknown>[] {
  const seriesKeys = spec.series.map((s) => s.key);
  return toRecords(spec).map((row) => {
    const out: Record<string, unknown> = { ...row };
    for (const key of seriesKeys) {
      const n = Number(row[key]);
      out[key] = Number.isFinite(n) ? n : row[key];
    }
    return out;
  });
}

function buildConfig(spec: ChartSpec): ChartConfig {
  const config: ChartConfig = {};
  spec.series.forEach((s, i) => {
    config[s.key] = { label: s.label ?? s.key, color: PALETTE[i % PALETTE.length] };
  });
  return config;
}

// chartType comes from the spec but the user can override it via the switcher,
// so it's passed separately.
export function ChartView({ spec, chartType }: { spec: ChartSpec; chartType: ChartType }) {
  if (chartType === "table") {
    return <ResultTable rows={toRecords(spec)} />;
  }

  if (chartType === "kpi") {
    return <KpiCards spec={spec} />;
  }

  const data = normalize(spec);
  const config = buildConfig(spec);
  const showLegend = spec.series.length > 1;

  return (
    <ChartContainer config={config} className="h-[360px] w-full">
      {renderChart(chartType, spec, data, showLegend)}
    </ChartContainer>
  );
}

function renderChart(
  chartType: ChartType,
  spec: ChartSpec,
  data: Record<string, unknown>[],
  showLegend: boolean
) {
  const { xKey, series } = spec;

  switch (chartType) {
    case "line":
      return (
        <LineChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} stroke={`var(--color-${s.key})`} dot={false} />
          ))}
        </LineChart>
      );

    case "area":
      return (
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              fill={`var(--color-${s.key})`}
              fillOpacity={0.2}
            />
          ))}
        </AreaChart>
      );

    case "pie":
      return (
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey={xKey} />} />
          <Pie data={data} dataKey={series[0].key} nameKey={xKey} innerRadius={60}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      );

    case "scatter":
      return (
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey={xKey} name={xKey} tickLine={false} axisLine={false} />
          <YAxis
            type="number"
            dataKey={series[0].key}
            name={series[0].label ?? series[0].key}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <ZAxis range={[60, 60]} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill={`var(--color-${series[0].key})`} />
        </ScatterChart>
      );

    case "bar":
    default:
      return (
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} />
          ))}
        </BarChart>
      );
  }
}

function KpiCards({ spec }: { spec: ChartSpec }) {
  const row = toRecords(spec)[0] ?? {};
  return (
    <div className="flex flex-wrap gap-4">
      {spec.series.map((s) => (
        <div key={s.key} className="rounded-lg border px-6 py-4">
          <div className="text-muted-foreground text-sm">{s.label ?? s.key}</div>
          <div className="font-semibold text-3xl tabular-nums">
            {String((row as Record<string, unknown>)[s.key] ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
}
