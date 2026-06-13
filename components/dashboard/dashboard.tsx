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
import { DatabaseIcon, MoreVerticalIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { deleteProject, listProjects, renameProject } from "@/lib/store/projects";
import { findModel } from "@/lib/ai/models";
import type { Project } from "@/lib/store/db";
import { ConnectionWizard } from "@/components/project/connection-wizard";
import { GlobalSettingsDialog } from "./global-settings-dialog";

function modelLabel(project: Project): string {
  if (!project.model) return "Default model";
  return findModel(project.model.provider, project.model.model)?.label ?? project.model.model;
}

export function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const refresh = useCallback(() => {
    listProjects().then(setProjects);
  }, []);

  useEffect(refresh, [refresh]);

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Your projects</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon className="size-4" /> Settings
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon className="size-4" /> New project
          </Button>
        </div>
      </div>

      {projects === null ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <DatabaseIcon className="size-6 text-muted-foreground" />
          <p className="font-medium">No projects yet</p>
          <p className="text-muted-foreground text-sm">
            Create a project to connect your own database.
          </p>
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon className="size-4" /> New project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer rounded-lg border p-4 hover:bg-muted/40"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{project.name}</p>
                  <p className="text-muted-foreground text-xs capitalize">{project.db.kind}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={() => setRenaming(project)}>Rename</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(project)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-4 text-muted-foreground text-xs">{modelLabel(project)}</p>
            </div>
          ))}
        </div>
      )}

      <ConnectionWizard
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => {
          setCreating(false);
          refresh();
        }}
      />
      <RenameDialog project={renaming} onClose={() => setRenaming(null)} onRenamed={refresh} />
      <DeleteDialog project={deleting} onClose={() => setDeleting(null)} onDeleted={refresh} />
      <GlobalSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} onChanged={refresh} />
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
  const [name, setName] = useState("");
  useEffect(() => setName(project?.name ?? ""), [project]);

  async function save() {
    if (!project || !name.trim()) return;
    await renameProject(project.id, name.trim());
    onRenamed();
    onClose();
  }

  return (
    <Dialog open={project !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
