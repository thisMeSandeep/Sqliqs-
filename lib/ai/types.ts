// Shared "which model + how to authenticate it" shape. Lives here (no runtime
// deps) so both the IndexedDB store and the provider seam (lib/ai/providers.ts)
// can use it without importing each other.

export type ProviderId =
  | "openrouter"
  | "anthropic"
  | "openai"
  | "google"
  | "xai"
  | "deepseek";

export type ModelChoice = {
  provider: ProviderId;
  model: string; // provider-native model id
  apiKey?: string; // omitted ⇒ free tier (our OpenRouter env key; provider must be "openrouter")
};
