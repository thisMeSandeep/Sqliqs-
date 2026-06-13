"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon } from "lucide-react";
import { deleteProject, renameProject, updateProject } from "@/lib/store/projects";
import { FREE_MODEL_CHOICE, getGlobalSettings } from "@/lib/store/settings";
import { ModelKeyPicker } from "./model-key-picker";
import type { Project } from "@/lib/store/db";
import type { ModelChoice } from "@/lib/ai/types";

// Project-level controls in the workspace header: rename, re-choose model/key,
// and delete. onChanged re-loads the project (so the surfaces pick up a new
// model); onDeleted navigates away.
export function ProjectMenu({
  project,
  onChanged,
  onDeleted,
}: {
  project: Project;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Project settings">
            <SettingsIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenaming(true)}>Rename</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setModelOpen(true)}>Model &amp; key</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        project={project}
        open={renaming}
        onOpenChange={setRenaming}
        onRenamed={onChanged}
      />
      <ModelDialog
        project={project}
        open={modelOpen}
        onOpenChange={setModelOpen}
        onSaved={onChanged}
      />
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the project and its chat history from this browser. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteProject(project.id);
                onDeleted();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RenameDialog({
  project,
  open,
  onOpenChange,
  onRenamed,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed: () => void;
}) {
  const [name, setName] = useState(project.name);

  async function save() {
    if (!name.trim()) return;
    await renameProject(project.id, name.trim());
    onRenamed();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
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

function ModelDialog({
  project,
  open,
  onOpenChange,
  onSaved,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [inheritGlobal, setInheritGlobal] = useState(project.model === null);
  const [override, setOverride] = useState<ModelChoice>(project.model ?? FREE_MODEL_CHOICE);

  // Seed the override from the global default when the project inherits.
  function onOpenChangeInternal(next: boolean) {
    if (next) {
      setInheritGlobal(project.model === null);
      if (project.model) setOverride(project.model);
      else getGlobalSettings().then(setOverride);
    }
    onOpenChange(next);
  }

  async function save() {
    await updateProject(project.id, { model: inheritGlobal ? null : override });
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeInternal}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Model &amp; key</DialogTitle>
          <DialogDescription>Choose the model this project uses.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Use my default model</p>
            <p className="text-muted-foreground text-xs">Inherit the global default.</p>
          </div>
          <Switch checked={inheritGlobal} onCheckedChange={setInheritGlobal} />
        </div>
        {!inheritGlobal && <ModelKeyPicker value={override} onChange={setOverride} />}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
