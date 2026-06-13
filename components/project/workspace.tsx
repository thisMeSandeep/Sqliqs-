"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3Icon, FileTextIcon, MessageSquareIcon, NetworkIcon } from "lucide-react";
import { Chat } from "@/components/chat/chat";

// The project workspace shell: switchable surfaces over one database. Chat is
// live now; Visualization / Reports / ER diagram land in Phases 3–5 and slot
// into these tabs. Same shell will wrap real projects in Phase 7.
export function Workspace() {
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
        <Chat />
      </TabsContent>
      <TabsContent value="visualization" className="flex-1">
        <ComingSoon surface="Visualization" />
      </TabsContent>
      <TabsContent value="reports" className="flex-1">
        <ComingSoon surface="Reports" />
      </TabsContent>
      <TabsContent value="er" className="flex-1">
        <ComingSoon surface="ER diagram" />
      </TabsContent>
    </Tabs>
  );
}

function ComingSoon({ surface }: { surface: string }) {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
      {surface} — coming soon
    </div>
  );
}
