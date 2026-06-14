"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckIcon, KeyRoundIcon } from "lucide-react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import {
  clearStoredKeys,
  FREE_MODEL_CHOICE,
  getGlobalSettings,
  setGlobalSettings,
} from "@/lib/store/settings";
import { clearAll } from "@/lib/store/db";
import type { ModelChoice } from "@/lib/ai/types";

// Global settings as a full page  Holds the default model
// new projects inherit and the destructive "clear all data" escape hatch.
export function SettingsView() {
  const router = useRouter();
  const [choice, setChoice] = useState<ModelChoice>(FREE_MODEL_CHOICE);
  const [saved, setSaved] = useState(false);
  const [keyMsg, setKeyMsg] = useState<string | null>(null);

  useEffect(() => {
    getGlobalSettings().then(setChoice);
  }, []);

  async function save() {
    await setGlobalSettings(choice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function clearKeys() {
    const removed = await clearStoredKeys();
    // Reflect the now key-less default in the picker.
    setChoice(await getGlobalSettings());
    setKeyMsg(
      removed === 0
        ? "No saved keys to remove."
        : `Removed ${removed} saved key${removed === 1 ? "" : "s"}.`
    );
    setTimeout(() => setKeyMsg(null), 3000);
  }

  async function wipe() {
    await clearAll();
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Back to dashboard">
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <span className="font-semibold tracking-tight">Settings</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-6 py-10">
        <section className="space-y-5">
          <div>
            <h2 className="font-semibold text-lg tracking-tight">Default model</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              New projects inherit this model. Use our free model, or bring your own provider and
              key.
            </p>
          </div>
          <ModelKeyPicker value={choice} onChange={setChoice} />
          <div className="flex items-center gap-3">
            <Button onClick={save}>Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600 text-sm dark:text-emerald-400">
                <CheckIcon className="size-4" /> Saved
              </span>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg tracking-tight">API keys</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Remove every saved provider key from this browser — your default and any per-project
              overrides. Projects, settings, and chat history stay; you&apos;ll fall back to the free
              model until you add a key again.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <KeyRoundIcon className="size-4" /> Clear saved keys
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear saved keys?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every provider API key stored in this browser — the global default
                    and all project overrides. Your projects, settings, and chat history are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearKeys}>Clear keys</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {keyMsg && (
              <span className="flex items-center gap-1 text-emerald-600 text-sm dark:text-emerald-400">
                <CheckIcon className="size-4" /> {keyMsg}
              </span>
            )}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg tracking-tight">Danger zone</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Permanently wipe every project, setting, and chat from this browser.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Clear all data</Button>
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
        </section>
      </main>
    </div>
  );
}
