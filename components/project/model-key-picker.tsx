"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import {
  findModel,
  PROVIDER_META,
  PROVIDERS_WITH_MODELS,
  providerIcon,
  type ModelTier,
} from "@/lib/ai/models";
import type { ModelChoice, ProviderId } from "@/lib/ai/types";

// Provider-first model picker (BYOK). Pick a provider (logo grid) → pick one of
// its models (tier-badged list) → enter the provider's API key if the model
// isn't free. Reused for the global default, the per-project override, and the
// connection wizard — same value/onChange contract throughout.
export function ModelKeyPicker({
  value,
  onChange,
}: {
  value: ModelChoice;
  onChange: (choice: ModelChoice) => void;
}) {
  const selected = findModel(value.provider, value.model);
  const needsKey = !selected?.free;
  const meta = PROVIDER_META[value.provider];
  const models = PROVIDERS_WITH_MODELS.find((p) => p.provider === value.provider)?.models ?? [];

  // Switching provider resets to its first model and drops the previous
  // provider's key (keys are provider-specific).
  function selectProvider(provider: ProviderId) {
    if (provider === value.provider) return;
    const first = PROVIDERS_WITH_MODELS.find((p) => p.provider === provider)?.models[0];
    if (!first) return;
    onChange({ provider, model: first.model, apiKey: undefined });
  }

  // Switching model within the same provider keeps the key (unless free).
  function selectModel(model: string) {
    const entry = findModel(value.provider, model);
    onChange({ provider: value.provider, model, apiKey: entry?.free ? undefined : value.apiKey });
  }

  return (
    <div className="space-y-6">
      {/* Provider grid */}
      <div className="space-y-2.5">
        <Label>Provider</Label>
        <div className="grid grid-cols-3 gap-3">
          {PROVIDERS_WITH_MODELS.map(({ provider }) => {
            const p = PROVIDER_META[provider];
            const active = provider === value.provider;
            return (
              <button
                key={provider}
                type="button"
                onClick={() => selectProvider(provider)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-lg border p-4 transition hover:bg-muted/50",
                  active && "border-primary ring-1 ring-primary"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={providerIcon(provider)}
                  alt=""
                  className={cn("size-6 object-contain", p.darkInvert && "dark:invert")}
                />
                <span className="text-xs font-medium">{p.label}</span>
                {p.freeTier && (
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                    Free
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Models for the selected provider */}
      <div className="space-y-2.5">
        <Label>Model</Label>
        <div className="space-y-2">
          {models.map((m) => {
            const active = m.model === value.model;
            return (
              <button
                key={m.model}
                type="button"
                onClick={() => selectModel(m.model)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left transition hover:bg-muted/50",
                  active && "border-primary bg-accent"
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  {active && <CheckIcon className="size-4 text-primary" />}
                  {m.label}
                </span>
                <TierBadge tier={m.tier} />
              </button>
            );
          })}
        </div>
      </div>

      {/* API key — only for models that aren't the free tier */}
      {needsKey && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label>{meta.label} API key</Label>
            <a
              href={meta.keyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
            >
              {meta.freeTier ? "Get a free key" : "Get a key"}
              <ExternalLinkIcon className="size-3" />
            </a>
          </div>
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

const TIER_STYLES: Record<ModelTier, string> = {
  free: "bg-primary/10 text-primary",
  cheap: "bg-muted text-muted-foreground",
  moderate: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  premium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function TierBadge({ tier }: { tier: ModelTier }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        TIER_STYLES[tier]
      )}
    >
      {tier}
    </span>
  );
}
