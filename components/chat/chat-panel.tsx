"use client";

import { useCallback, useEffect, useState } from "react";
import { listSessions, newSession } from "@/lib/store/history";
import type { Session } from "@/lib/store/db";
import type { ConnectionConfig } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat } from "./chat";

// Project-mode chat: a sessions sidebar over the Chat thread. Sessions persist
// to IndexedDB; the latest is restored on load (the playground uses <Chat>
// directly with no session, so it stays ephemeral).
export function ChatPanel({ projectId, config }: { projectId: string; config: ConnectionConfig }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);

  const refresh = useCallback(() => {
    listSessions(projectId).then(setSessions);
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    listSessions(projectId).then((list) => {
      if (cancelled) return;
      setSessions(list);
      setActive(list[0] ?? newSession(projectId, "chat", "New chat"));
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!active) return null;

  return (
    <div className="flex h-full">
      <aside className="flex w-56 shrink-0 flex-col border-r">
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setActive(newSession(projectId, "chat", "New chat"))}
          >
            <PlusIcon className="size-4" /> New chat
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-2 pt-0">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                s.id === active.id && "bg-muted"
              )}
            >
              <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="min-h-0 flex-1">
        <Chat key={active.id} config={config} session={active} onPersisted={refresh} />
      </div>
    </div>
  );
}
