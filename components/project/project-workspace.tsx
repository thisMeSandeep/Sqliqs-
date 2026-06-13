"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProject } from "@/lib/store/projects";
import { resolveModel } from "@/lib/store/settings";
import type { Project } from "@/lib/store/db";
import type { ConnectionConfig } from "@/lib/ai/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { Workspace } from "./workspace";
import { ProjectMenu } from "./project-menu";

type State =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; project: Project; config: ConnectionConfig };

// Loads the project from IndexedDB (client-side), resolves its effective model
// (own override or the global default), and feeds the surfaces via Workspace.
export function ProjectWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    const project = await getProject(id);
    if (!project) {
      setState({ status: "notfound" });
      return;
    }
    const model = await resolveModel(project);
    setState({
      status: "ready",
      project,
      config: { kind: project.db.kind, connectionString: project.db.connectionString, model },
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm" className="shrink-0">
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{state.project.name}</h1>
            <p className="text-muted-foreground text-xs capitalize">{state.project.db.kind}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <ProjectMenu
            project={state.project}
            onChanged={load}
            onDeleted={() => router.push("/dashboard")}
          />
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Workspace config={state.config} projectId={state.project.id} />
      </div>
    </main>
  );
}
