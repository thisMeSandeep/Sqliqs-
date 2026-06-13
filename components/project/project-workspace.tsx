"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProject } from "@/lib/store/projects";
import { resolveModel } from "@/lib/store/settings";
import type { Project } from "@/lib/store/db";
import type { ConnectionConfig } from "@/lib/ai/types";
import { Workspace } from "./workspace";

type State =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; project: Project; config: ConnectionConfig };

// Loads the project from IndexedDB (client-side), resolves its effective model
// (own override or the global default), and feeds the surfaces via Workspace.
export function ProjectWorkspace({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const project = await getProject(id);
      if (cancelled) return;
      if (!project) {
        setState({ status: "notfound" });
        return;
      }
      const model = await resolveModel(project);
      if (cancelled) return;
      setState({
        status: "ready",
        project,
        config: { kind: project.db.kind, connectionString: project.db.connectionString, model },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground text-sm">
        Loading project…
      </main>
    );
  }

  if (state.status === "notfound") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">This project doesn’t exist in this browser.</p>
        <Button asChild size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{state.project.name}</h1>
            <p className="text-muted-foreground text-xs capitalize">{state.project.db.kind}</p>
          </div>
        </div>
        <UserButton />
      </header>
      <div className="min-h-0 flex-1">
        <Workspace config={state.config} />
      </div>
    </main>
  );
}
