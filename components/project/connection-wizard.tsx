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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createProject } from "@/lib/store/projects";
import { FREE_MODEL_CHOICE, getGlobalSettings } from "@/lib/store/settings";
import { findModel } from "@/lib/ai/models";
import { ModelKeyPicker } from "./model-key-picker";
import type { DbKind } from "@/lib/db/types";
import type { ModelChoice } from "@/lib/ai/types";

// public/databases/<file>.svg — postgres is enabled; the rest land in Phase 8.
const DB_OPTIONS: { kind: DbKind; label: string; file: string; enabled: boolean }[] = [
  { kind: "postgres", label: "PostgreSQL", file: "postgresql", enabled: true },
  { kind: "mysql", label: "MySQL", file: "mysql-wordmark-light", enabled: true },
  { kind: "sqlite", label: "SQLite", file: "sqlite", enabled: true },
  { kind: "mongodb", label: "MongoDB", file: "mongodb", enabled: true },
];

// Per-engine example connection strings for the input placeholder.
const CONN_PLACEHOLDER: Record<DbKind, string> = {
  postgres: "postgresql://user:pass@host:5432/db",
  mysql: "mysql://user:pass@host:3306/db",
  sqlite: "file:./dev.db or libsql://your-db.turso.io?authToken=XXX",
  mongodb: "mongodb+srv://user:pass@cluster/db",
};

type TestState = { status: "idle" | "testing" | "ok" | "error"; message?: string };

export function ConnectionWizard({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {/* The form state lives in WizardForm, which Radix unmounts when the
            dialog closes — so each open starts fresh with no reset effect. */}
        {open && <WizardForm onOpenChange={onOpenChange} onCreated={onCreated} />}
      </DialogContent>
    </Dialog>
  );
}

function WizardForm({
  onOpenChange,
  onCreated,
}: {
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<DbKind>("postgres");
  const [connectionString, setConnectionString] = useState("");
  const [test, setTest] = useState<TestState>({ status: "idle" });
  const [inheritGlobal, setInheritGlobal] = useState(true);
  const [globalDefault, setGlobalDefault] = useState<ModelChoice>(FREE_MODEL_CHOICE);
  const [override, setOverride] = useState<ModelChoice>(FREE_MODEL_CHOICE);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the model choice from the global default (external data → effect is fine).
  useEffect(() => {
    getGlobalSettings().then((g) => {
      setGlobalDefault(g);
      setOverride(g);
    });
  }, []);

  async function runTest() {
    setTest({ status: "testing" });
    try {
      const res = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, connectionString: connectionString.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Connection failed");
      const count = Array.isArray(json.tables) ? json.tables.length : 0;
      setTest({ status: "ok", message: `Connected — found ${count} table${count === 1 ? "" : "s"}.` });
    } catch (e) {
      setTest({ status: "error", message: e instanceof Error ? e.message : "Connection failed" });
    }
  }

  async function create() {
    setSaving(true);
    try {
      const project = await createProject({
        name: name.trim(),
        db: { kind, connectionString: connectionString.trim() },
        model: inheritGlobal ? null : override,
      });
      onCreated(project.id);
    } finally {
      setSaving(false);
    }
  }

  // Re-test whenever the connection string changes after a prior result.
  function onConnChange(value: string) {
    setConnectionString(value);
    if (test.status !== "idle") setTest({ status: "idle" });
  }

  const canNext =
    (step === 1 && DB_OPTIONS.find((o) => o.kind === kind)?.enabled) ||
    (step === 2 && test.status === "ok") ||
    step === 3;

  const globalLabel =
    findModel(globalDefault.provider, globalDefault.model)?.label ?? globalDefault.model;

  return (
    <>
      <DialogHeader>
        <DialogTitle>New project — step {step} of 4</DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose the database you want to connect."}
            {step === 2 && "Enter the connection string and test it."}
            {step === 3 && "Choose the model for this project."}
            {step === 4 && "Name your project."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {DB_OPTIONS.map((opt) => (
              <button
                key={opt.kind}
                type="button"
                disabled={!opt.enabled}
                onClick={() => setKind(opt.kind)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                  kind === opt.kind && opt.enabled ? "border-primary ring-1 ring-primary" : "",
                  opt.enabled ? "hover:bg-muted/50" : "cursor-not-allowed opacity-50"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/databases/${opt.file}.svg`} alt="" className="size-7" />
                <div>
                  <div className="font-medium text-sm">{opt.label}</div>
                  {!opt.enabled && <div className="text-muted-foreground text-xs">Coming soon</div>}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Connection string</Label>
              <Input
                value={connectionString}
                onChange={(e) => onConnChange(e.target.value)}
                placeholder={CONN_PLACEHOLDER[kind]}
              />
              <p className="text-muted-foreground text-xs">
                Stored only in your browser. Sent per request, never saved on our servers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={runTest}
                disabled={!connectionString.trim() || test.status === "testing"}
              >
                {test.status === "testing" && <Loader2Icon className="size-4 animate-spin" />}
                Test connection
              </Button>
              {test.status === "ok" && (
                <span className="flex items-center gap-1 text-emerald-600 text-sm">
                  <CheckCircle2Icon className="size-4" /> {test.message}
                </span>
              )}
              {test.status === "error" && (
                <span className="flex items-center gap-1 text-destructive text-sm">
                  <XCircleIcon className="size-4" /> {test.message}
                </span>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Use my default model</p>
                <p className="text-muted-foreground text-xs">Inherit the global default ({globalLabel}).</p>
              </div>
              <Switch checked={inheritGlobal} onCheckedChange={setInheritGlobal} />
            </div>
            {!inheritGlobal && <ModelKeyPicker value={override} onChange={setOverride} />}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-1.5">
            <Label>Project name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My database" />
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 1 ? onOpenChange(false) : setStep(step - 1))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Next
            </Button>
          ) : (
            <Button onClick={create} disabled={!name.trim() || saving}>
              {saving ? "Creating…" : "Create project"}
            </Button>
          )}
        </DialogFooter>
    </>
  );
}
