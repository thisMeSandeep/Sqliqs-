"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteSession, listSessions, newSession } from "@/lib/store/history";
import type { Session } from "@/lib/store/db";
import type { ConnectionConfig } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageSquareIcon, PanelLeftIcon, PlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat } from "./chat";

// Project-mode chat: a collapsible, mobile-responsive sessions sidebar over the
// Chat thread. Sessions persist to IndexedDB; the latest is restored on load
// (the playground uses <Chat> directly with no session, so it stays ephemeral).
export function ChatPanel({ projectId, config }: { projectId: string; config: ConnectionConfig }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [open, setOpen] = useState(true);
  const [deleting, setDeleting] = useState<Session | null>(null);

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

  // Default the sidebar closed on small screens (it opens as an overlay there).
  useEffect(() => {
    setOpen(window.innerWidth >= 768);
  }, []);

  function startNew() {
    setActive(newSession(projectId, "chat", "New chat"));
    if (window.innerWidth < 768) setOpen(false);
  }

  function pick(s: Session) {
    setActive(s);
    if (window.innerWidth < 768) setOpen(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteSession(deleting.id);
    const remaining = sessions.filter((s) => s.id !== deleting.id);
    setSessions(remaining);
    if (active?.id === deleting.id) {
      setActive(remaining[0] ?? newSession(projectId, "chat", "New chat"));
    }
    setDeleting(null);
  }

  if (!active) return null;

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Mobile backdrop when the overlay sidebar is open */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="absolute inset-0 z-20 bg-foreground/20 md:hidden"
        />
      )}

      <aside
        className={cn(
          "z-30 flex shrink-0 flex-col border-r bg-background transition-[width] duration-200",
          // Overlay on mobile, in-flow column on desktop.
          "max-md:absolute max-md:inset-y-0 max-md:left-0",
          open ? "w-64" : "w-0 overflow-hidden border-r-0"
        )}
      >
        <div className="flex items-center justify-between p-2">
          <span className="px-1 text-muted-foreground text-xs font-medium">Chats</span>
          <Button variant="ghost" size="icon-sm" aria-label="New chat" onClick={startNew}>
            <SquarePenIcon className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-2 pt-0">
          {sessions.length === 0 && (
            <p className="px-2 py-1.5 text-muted-foreground text-xs">No saved chats yet.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-1 rounded-md pr-1 text-sm hover:bg-muted",
                s.id === active.id && "bg-muted"
              )}
            >
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left"
              >
                <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{s.title}</span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${s.title}`}
                onClick={() => setDeleting(s)}
                className="size-7 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-1 border-b px-2 py-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={open ? "Hide chats" : "Show chats"}
            onClick={() => setOpen((o) => !o)}
          >
            <PanelLeftIcon className="size-4" />
          </Button>
          {!open && (
            <Button variant="ghost" size="icon-sm" aria-label="New chat" onClick={startNew}>
              <PlusIcon className="size-4" />
            </Button>
          )}
          <span className="truncate text-muted-foreground text-sm">{active.title}</span>
        </div>
        <div className="min-h-0 flex-1">
          <Chat key={active.id} config={config} session={active} onPersisted={refresh} />
        </div>
      </div>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” and its messages will be removed from this browser. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
