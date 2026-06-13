import type { ProviderId } from "./types";

// The curated list users pick from. Hardcoded on purpose (PRODUCT-SCOPE:
// "curated list"). Each entry's `model` is the PROVIDER-NATIVE id, so the
// provider seam can pass it straight through.
//
// NOTE: model ids drift — verify each against the provider's own docs before
// trusting in production. The free OpenRouter entry is the only one confirmed.
export type CatalogEntry = {
  provider: ProviderId;
  model: string;
  label: string;
  free?: boolean;
};

export const MODEL_CATALOG: CatalogEntry[] = [
  { provider: "openrouter", model: "openrouter/free", label: "Free (OpenRouter)", free: true },
  { provider: "anthropic", model: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  { provider: "anthropic", model: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { provider: "openai", model: "gpt-4o-mini", label: "GPT-4o mini" },
  { provider: "openai", model: "gpt-4o", label: "GPT-4o" },
  { provider: "google", model: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { provider: "deepseek", model: "deepseek-chat", label: "DeepSeek Chat" },
  { provider: "xai", model: "grok-2", label: "Grok 2" },
];

// Display metadata per provider. Icons live in app/assets/providers/<id>.svg;
// the picker maps them (assets aren't URL-served, so they're imported there).
export const PROVIDER_META: Record<ProviderId, { label: string }> = {
  openrouter: { label: "OpenRouter" },
  anthropic: { label: "Anthropic" },
  openai: { label: "OpenAI" },
  google: { label: "Google" },
  xai: { label: "xAI" },
  deepseek: { label: "DeepSeek" },
};

export function findModel(provider: ProviderId, model: string): CatalogEntry | undefined {
  return MODEL_CATALOG.find((m) => m.provider === provider && m.model === model);
}
