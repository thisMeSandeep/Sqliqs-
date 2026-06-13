"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng, toSvg } from "html-to-image";
import { Button } from "@/components/ui/button";
import { DownloadIcon, KeyIcon } from "lucide-react";
import type { TableInfo } from "@/lib/db/types";
import type { ConnectionConfig } from "@/lib/ai/types";
import { toRequestBody } from "@/lib/ai/request";

type TableNodeData = { table: TableInfo; fkColumns: Set<string> };

// One node per table: a header with the table name and a row per column,
// foreign-key columns flagged. Handles on both sides so FK edges can attach.
function TableNode({ data }: NodeProps<Node<TableNodeData>>) {
  const { table, fkColumns } = data;
  return (
    <div className="min-w-52 overflow-hidden rounded-md border bg-card shadow-sm">
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <div className="border-b bg-muted px-3 py-1.5 font-semibold text-sm">{table.name}</div>
      <div className="divide-y">
        {table.columns.map((col) => (
          <div key={col.name} className="flex items-center justify-between gap-4 px-3 py-1 text-xs">
            <span className="flex items-center gap-1 font-medium">
              {fkColumns.has(col.name) && <KeyIcon className="size-3 text-muted-foreground" />}
              {col.name}
            </span>
            <span className="text-muted-foreground">{col.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
    </div>
  );
}

const nodeTypes = { table: TableNode };

// Lay tables out in a simple grid — draggable + fit-to-view afterward.
function buildGraph(tables: TableInfo[]): { nodes: Node<TableNodeData>[]; edges: Edge[] } {
  const cols = Math.ceil(Math.sqrt(tables.length));
  const nodes: Node<TableNodeData>[] = tables.map((table, i) => ({
    id: table.name,
    type: "table",
    position: { x: (i % cols) * 340, y: Math.floor(i / cols) * 360 },
    data: { table, fkColumns: new Set(table.foreignKeys.map((fk) => fk.column)) },
  }));

  const edges: Edge[] = tables.flatMap((table) =>
    table.foreignKeys.map((fk) => ({
      id: `${table.name}.${fk.column}->${fk.refTable}`,
      source: table.name,
      target: fk.refTable,
      label: `${fk.column} → ${fk.refColumn}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 1.5 },
    }))
  );

  return { nodes, edges };
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// Inner component so it can use useReactFlow — getNodes() returns the nodes WITH
// their measured dimensions, which getNodesBounds needs to frame the full graph.
// (The static nodes array has no measured size, which is why export only
// captured a corner before.)
function Flow({ nodes, edges }: { nodes: Node<TableNodeData>[]; edges: Edge[] }) {
  const { getNodes } = useReactFlow();

  // React Flow's canonical download-image approach: pick a fixed output frame,
  // then let getViewportForBounds compute the pan/zoom that fits the whole graph
  // into that frame. We capture the .react-flow__viewport element at that exact
  // size + transform, so nothing is clipped regardless of node coordinates.
  const exportAs = useCallback(
    async (format: "png" | "svg") => {
      const viewport = document.querySelector<HTMLElement>(".react-flow__viewport");
      const measured = getNodes();
      if (!viewport || measured.length === 0) return;

      const bounds = getNodesBounds(measured);
      const pad = 0.1; // 10% padding around the graph
      const imageWidth = Math.max(Math.round(bounds.width * 1.2), 1024);
      const imageHeight = Math.max(Math.round(bounds.height * 1.2), 768);
      const t = getViewportForBounds(bounds, imageWidth, imageHeight, 0.2, 2, pad);

      const options = {
        backgroundColor: "white",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.zoom})`,
        },
      };

      const dataUrl =
        format === "png" ? await toPng(viewport, options) : await toSvg(viewport, options);
      downloadDataUrl(dataUrl, `er-diagram.${format}`);
    },
    [getNodes]
  );

  return (
    <div className="relative h-full">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => exportAs("png")}>
          <DownloadIcon className="size-4" /> PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportAs("svg")}>
          <DownloadIcon className="size-4" /> SVG
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function ErDiagram({ config }: { config?: ConnectionConfig }) {
  const [tables, setTables] = useState<TableInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRequestBody(config) ?? {}),
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setTables(json.tables);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load schema"));
    return () => {
      cancelled = true;
    };
  }, [config]);

  const { nodes, edges } = useMemo(() => buildGraph(tables ?? []), [tables]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive text-sm">{error}</div>
    );
  }

  if (!tables) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Loading schema…
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <Flow nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
}
