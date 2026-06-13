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

// What a surface sends per request so the route knows which database to query
// and which model to use. Omitted entirely by the playground (server defaults).
export type ConnectionConfig = {
  kind: import("@/lib/db/types").DbKind;
  connectionString: string;
  model: ModelChoice;
};
