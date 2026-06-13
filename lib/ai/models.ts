import type { ProviderId } from "./types";

// The curated list users pick from. Hardcoded on purpose (PRODUCT-SCOPE:
// "curated list"). Each entry's `model` is the PROVIDER-NATIVE id, so the
// provider seam can pass it straight through.
//
// NOTE: model ids drift — verify each against the provider's own docs before
// trusting in production. The free OpenRouter entry is the only one confirmed.
// Tier powers the picker grouping; every entry supports tool calls + structured
// output (the two things Sqliqs needs). See docs/DESIGN.md for the rationale and
// the per-provider "verify these IDs" note.
export type ModelTier = "free" | "cheap" | "moderate" | "premium";

export type CatalogEntry = {
  provider: ProviderId;
  model: string;
  label: string;
  tier: ModelTier;
  free?: boolean;
};

// Native provider IDs (NOT OpenRouter slugs) — see docs/DESIGN.md. Anthropic is
// confirmed; verify the rest against each provider's own model list.
export const MODEL_CATALOG: CatalogEntry[] = [
  { provider: "openrouter", model: "openrouter/free", label: "Free (OpenRouter)", tier: "free", free: true },


  { provider: "anthropic", model: "claude-haiku-4-5", label: "Claude Haiku 4.5", tier: "cheap" },
  { provider: "anthropic", model: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", tier: "moderate" },
  { provider: "anthropic", model: "claude-opus-4-8", label: "Claude Opus 4.8", tier: "premium" },


  { provider: "google", model: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", tier: "cheap" },
  { provider: "google", model: "gemini-3-flash", label: "Gemini 3 Flash", tier: "moderate" },
  { provider: "google", model: "gemini-2.5-pro", label: "Gemini 2.5 Pro", tier: "premium" },

  { provider: "openai", model: "gpt-5.4-mini", label: "GPT-5.4 mini", tier: "cheap" },
  { provider: "openai", model: "gpt-5.4", label: "GPT-5.4", tier: "moderate" },
  { provider: "openai", model: "gpt-5.5", label: "GPT-5.5", tier: "premium" },

  { provider: "deepseek", model: "deepseek-v4-flash", label: "DeepSeek V4 Flash", tier: "cheap" },
  { provider: "deepseek", model: "deepseek-v4-pro", label: "DeepSeek V4 Pro", tier: "moderate" },

  { provider: "xai", model: "grok-4.3", label: "Grok 4.3", tier: "moderate" },
];

// Display metadata per provider. Icons are served from public/providers/;
// keyUrl is where the user creates a BYOK key (shown in the picker); freeTier
// marks providers where a usable key is available at no cost. darkInvert marks
// monochrome (black) logos that disappear on dark backgrounds and need a
// `dark:invert` filter — colored logos (Google, DeepSeek) are left untouched.
export const PROVIDER_META: Record<
  ProviderId,
  { label: string; keyUrl: string; freeTier?: boolean; darkInvert?: boolean }
> = {
  openrouter: { label: "OpenRouter", keyUrl: "https://openrouter.ai/keys", freeTier: true, darkInvert: true },
  anthropic: { label: "Anthropic", keyUrl: "https://console.anthropic.com/settings/keys", darkInvert: true },
  openai: { label: "OpenAI", keyUrl: "https://platform.openai.com/api-keys", darkInvert: true },
  google: { label: "Google", keyUrl: "https://aistudio.google.com/apikey", freeTier: true },
  xai: { label: "xAI", keyUrl: "https://console.x.ai", darkInvert: true },
  deepseek: { label: "DeepSeek", keyUrl: "https://platform.deepseek.com/api_keys" },
};

// Providers in display order, with the models grouped under each. Drives the
// provider-first picker (logos → models). OpenRouter's free entry is handled
// separately (no key), so it's excluded from the BYOK provider grouping.
export const PROVIDERS_WITH_MODELS = (
  Object.keys(PROVIDER_META) as ProviderId[]
).map((provider) => ({
  provider,
  models: MODEL_CATALOG.filter((m) => m.provider === provider),
}));

// Public URL of a provider's icon. (xAI's file is named grok.svg.)
const ICON_FILE: Record<ProviderId, string> = {
  openrouter: "openrouter",
  anthropic: "anthropic",
  openai: "openai",
  google: "google",
  xai: "grok",
  deepseek: "deepseek",
};

export function providerIcon(provider: ProviderId): string {
  return `/providers/${ICON_FILE[provider]}.svg`;
}

export function findModel(provider: ProviderId, model: string): CatalogEntry | undefined {
  return MODEL_CATALOG.find((m) => m.provider === provider && m.model === model);
}
