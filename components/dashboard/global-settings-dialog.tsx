"use client";

import { useEffect, useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModelKeyPicker } from "@/components/project/model-key-picker";
import { FREE_MODEL_CHOICE, getGlobalSettings, setGlobalSettings } from "@/lib/store/settings";
import { clearAll } from "@/lib/store/db";
import type { ModelChoice } from "@/lib/ai/types";

// Global default model/key that new projects inherit, plus the "clear all data"
// escape hatch. Same picker as the per-project override.
export function GlobalSettingsDialog({
  open,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [choice, setChoice] = useState<ModelChoice>(FREE_MODEL_CHOICE);

  useEffect(() => {
    if (open) getGlobalSettings().then(setChoice);
  }, [open]);

  async function save() {
    await setGlobalSettings(choice);
    onChanged();
    onOpenChange(false);
  }

  async function wipe() {
    await clearAll();
    setChoice(FREE_MODEL_CHOICE);
    onChanged();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            The default model new projects inherit. Use our free model, or bring your own provider
            and key.
          </DialogDescription>
        </DialogHeader>

        <ModelKeyPicker value={choice} onChange={setChoice} />

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Clear all data</p>
            <p className="text-muted-foreground text-xs">
              Removes every project, setting, and chat from this browser.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently wipes all projects, settings, and chat history from this browser.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={wipe}>Clear everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

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
