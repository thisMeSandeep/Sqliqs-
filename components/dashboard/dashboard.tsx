"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRightIcon,
  DatabaseIcon,
  MoreVerticalIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { deleteProject, listProjects, renameProject } from "@/lib/store/projects";
import { findModel, PROVIDER_META, providerIcon } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { DB_META } from "@/lib/db/meta";
import type { Project } from "@/lib/store/db";
import Link from "next/link";
import { ConnectionWizard } from "@/components/project/connection-wizard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/brand/logo";

function relativeTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const refresh = useCallback(() => {
    listProjects().then(setProjects);
  }, []);

  useEffect(refresh, [refresh]);

  const count = projects?.length ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon-sm" aria-label="Settings">
            <Link href="/settings">
              <SettingsIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Each project connects one database. Ask questions, visualize, and report.
            </p>
          </div>
          {count > 0 && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <PlusIcon className="size-4" /> New project
            </Button>
          )}
        </div>

        {projects === null ? (
          <CardGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </CardGrid>
        ) : projects.length === 0 ? (
          <EmptyState onCreate={() => setCreating(true)} />
        ) : (
          <CardGrid>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => router.push(`/projects/${project.id}`)}
                onRename={() => setRenaming(project)}
                onDelete={() => setDeleting(project)}
              />
            ))}
          </CardGrid>
        )}
      </main>

      <ConnectionWizard
        open={creating}
        onOpenChange={setCreating}
        onCreated={(id) => {
          setCreating(false);
          router.push(`/projects/${id}`);
        }}
      />
      <RenameDialog project={renaming} onClose={() => setRenaming(null)} onRenamed={refresh} />
      <DeleteDialog project={deleting} onClose={() => setDeleting(null)} onDeleted={refresh} />
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function ProjectCard({
  project,
  onOpen,
  onRename,
  onDelete,
}: {
  project: Project;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const meta = DB_META[project.db.kind];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.icon} alt="" className="size-6 object-contain" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1 -mt-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium">{project.name}</p>
        <p className="mt-0.5 text-muted-foreground text-xs">Updated {relativeTime(project.updatedAt)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="font-normal">
          {meta.label}
        </Badge>
        <ModelBadge project={project} />
      </div>

      <ArrowUpRightIcon className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

function ModelBadge({ project }: { project: Project }) {
  if (!project.model) {
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        Default model
      </Badge>
    );
  }
  const label = findModel(project.model.provider, project.model.model)?.label ?? project.model.model;
  return (
    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={providerIcon(project.model.provider)}
        alt=""
        className={cn("size-3", PROVIDER_META[project.model.provider].darkInvert && "dark:invert")}
      />
      {label}
    </Badge>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <Skeleton className="size-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted">
        <DatabaseIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No projects yet</p>
        <p className="mx-auto max-w-sm text-muted-foreground text-sm">
          Connect a database to start asking questions in plain English — bring your own data and
          your own key.
        </p>
      </div>
      <Button size="sm" onClick={onCreate}>
        <PlusIcon className="size-4" /> New project
      </Button>
    </div>
  );
}

function RenameDialog({
  project,
  onClose,
  onRenamed,
}: {
  project: Project | null;
  onClose: () => void;
  onRenamed: () => void;
}) {
  return (
    <Dialog open={project !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
        </DialogHeader>
        {/* Keyed by id so the form remounts with fresh state per project —
            no reset effect needed. */}
        {project && (
          <RenameForm key={project.id} project={project} onClose={onClose} onRenamed={onRenamed} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({
  project,
  onClose,
  onRenamed,
}: {
  project: Project;
  onClose: () => void;
  onRenamed: () => void;
}) {
  const [name, setName] = useState(project.name);

  async function save() {
    if (!name.trim()) return;
    await renameProject(project.id, name.trim());
    onRenamed();
    onClose();
  }

  return (
    <>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        autoFocus
      />
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!name.trim()}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}

function DeleteDialog({
  project,
  onClose,
  onDeleted,
}: {
  project: Project | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  async function confirm() {
    if (!project) return;
    await deleteProject(project.id);
    onDeleted();
    onClose();
  }

  return (
    <AlertDialog open={project !== null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{project?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the project and its chat history from this browser. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
