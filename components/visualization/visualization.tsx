"use client";

import { useRef, useState } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, DownloadIcon } from "lucide-react";
import { CHART_TYPE_LABELS, CHART_TYPES, type ChartSpec, type ChartType } from "@/lib/ai/charts";
import type { ConnectionConfig } from "@/lib/ai/types";
import { toRequestBody } from "@/lib/ai/request";
import { exportChartPng, exportChartSvg } from "@/lib/export/chart";
import { ChartView } from "./chart-view";

// Schema-agnostic prompts — the model reads the live schema, so these fit any
// connected database rather than the sample data.
const suggestions = [
  "A bar chart of record counts by category",
  "The distribution of a key column as a pie chart",
  "A trend over time if the data has dates",
];

type Status = "idle" | "loading" | "error";

export function Visualization({ config }: { config?: ConnectionConfig }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<ChartSpec | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const chartRef = useRef<HTMLDivElement>(null);

  async function run(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, ...toRequestBody(config) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate chart");
      const next = json as ChartSpec;
      setSpec(next);
      setChartType(next.chartType);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }

  function exportAs(format: "svg" | "png") {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const name = `${spec?.title ?? "chart"}.${format}`.replace(/\s+/g, "-").toLowerCase();
    if (format === "svg") exportChartSvg(svg as SVGSVGElement, name);
    else exportChartPng(svg as SVGSVGElement, name);
  }

  const canExport = spec !== null && chartType !== "table" && chartType !== "kpi";

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {status === "loading" && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Building your chart…
          </div>
        )}

        {status === "error" && (
          <div className="flex h-full items-center justify-center text-destructive text-sm">
            {error}
          </div>
        )}

        {status === "idle" && !spec && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <BarChart3Icon className="size-6 text-muted-foreground" />
            <div>
              <p className="font-medium">Describe a chart</p>
              <p className="text-muted-foreground text-sm">
                Ask for a visualization in plain English — the model picks the chart and the data.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => run(s)}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === "idle" && spec && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{spec.title}</h3>
              <div className="flex items-center gap-2">
                <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {CHART_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canExport}
                  onClick={() => exportAs("png")}
                >
                  <DownloadIcon className="size-4" /> PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canExport}
                  onClick={() => exportAs("svg")}
                >
                  <DownloadIcon className="size-4" /> SVG
                </Button>
              </div>
            </div>
            <div ref={chartRef} className="rounded-lg border p-4">
              <ChartView spec={spec} chartType={chartType} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <PromptInput onSubmit={(message) => run(message.text)}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the chart you want…"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status === "loading" ? "submitted" : undefined} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
