"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3Icon, FileTextIcon, MessageSquareIcon, NetworkIcon } from "lucide-react";
import { Chat } from "@/components/chat/chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Visualization } from "@/components/visualization/visualization";
import { Reports } from "@/components/reports/reports";
import { ErDiagram } from "@/components/er-diagram/er-diagram";
import type { ConnectionConfig } from "@/lib/ai/types";

export function Workspace({
  config,
  projectId,
}: {
  config?: ConnectionConfig;
  projectId?: string;
}) {
  return (
    <Tabs defaultValue="chat" className="flex h-full flex-col gap-0">
      {/* Icon-only on small screens so the four tabs never overflow; labels
          appear from sm up. overflow-x-auto is a safety net for very narrow widths. */}
      <div className="overflow-x-auto border-b px-4 py-2">
        <TabsList>
          <TabsTrigger value="chat" aria-label="Chat">
            <MessageSquareIcon className="size-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" aria-label="Visualization">
            <BarChart3Icon className="size-4" />
            <span className="hidden sm:inline">Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="reports" aria-label="Reports">
            <FileTextIcon className="size-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="er" aria-label="ER diagram">
            <NetworkIcon className="size-4" />
            <span className="hidden sm:inline">ER diagram</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chat" className="min-h-0 flex-1">
        {projectId && config ? (
          <ChatPanel projectId={projectId} config={config} />
        ) : (
          <Chat config={config} />
        )}
      </TabsContent>
      <TabsContent value="visualization" className="min-h-0 flex-1">
        <Visualization config={config} />
      </TabsContent>
      <TabsContent value="reports" className="min-h-0 flex-1">
        <Reports config={config} />
      </TabsContent>
      <TabsContent value="er" className="min-h-0 flex-1">
        <ErDiagram config={config} />
      </TabsContent>
    </Tabs>
  );
}
