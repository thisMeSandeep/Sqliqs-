"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findModel, MODEL_CATALOG, PROVIDER_META, providerIcon } from "@/lib/ai/models";
import type { ModelChoice, ProviderId } from "@/lib/ai/types";

// Reused for the global default and the per-project override. Picks a model
// from the curated catalog; non-free models reveal an API-key field (BYOK).
export function ModelKeyPicker({
  value,
  onChange,
}: {
  value: ModelChoice;
  onChange: (choice: ModelChoice) => void;
}) {
  const key = `${value.provider}::${value.model}`;
  const selected = findModel(value.provider, value.model);
  const needsKey = !selected?.free;

  function selectModel(k: string) {
    const [provider, model] = k.split("::") as [ProviderId, string];
    const entry = findModel(provider, model);
    // Free choice drops the key; switching paid models keeps the key entered.
    onChange({ provider, model, apiKey: entry?.free ? undefined : value.apiKey });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Model</Label>
        <Select value={key} onValueChange={selectModel}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_CATALOG.map((entry) => (
              <SelectItem
                key={`${entry.provider}::${entry.model}`}
                value={`${entry.provider}::${entry.model}`}
              >
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={providerIcon(entry.provider)} alt="" width={16} height={16} />
                  {entry.label}
                  {entry.free && <span className="text-muted-foreground text-xs">· free</span>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsKey && (
        <div className="space-y-1.5">
          <Label>{PROVIDER_META[value.provider].label} API key</Label>
          <Input
            type="password"
            autoComplete="off"
            placeholder="Paste your API key"
            value={value.apiKey ?? ""}
            onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">
            Stored only in your browser and sent per request. Never saved on our servers.
          </p>
        </div>
      )}
    </div>
  );
}
