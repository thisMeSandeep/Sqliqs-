"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3Icon, FileTextIcon, MessageSquareIcon, NetworkIcon } from "lucide-react";
import { Chat } from "@/components/chat/chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Visualization } from "@/components/visualization/visualization";
import { Reports } from "@/components/reports/reports";
import { ErDiagram } from "@/components/er-diagram/er-diagram";
import type { ConnectionConfig } from "@/lib/ai/types";

// The project workspace shell: switchable surfaces over one database — Chat,
// Visualization, Reports, ER diagram. The same shell will wrap real projects in
// Phase 7; here it runs against the playground's sample DB.
export function Workspace({
  config,
  projectId,
}: {
  config?: ConnectionConfig;
  projectId?: string;
}) {
  return (
    <Tabs defaultValue="chat" className="flex h-full flex-col gap-0">
      <div className="border-b px-4 py-2">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquareIcon className="size-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="visualization">
            <BarChart3Icon className="size-4" /> Visualization
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileTextIcon className="size-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="er">
            <NetworkIcon className="size-4" /> ER diagram
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
