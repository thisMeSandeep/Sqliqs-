import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";
import type { ModelChoice } from "./types";

// The provider seam — the one place that knows which LLM provider we're talking
// to. Give it a ModelChoice, get back an AI SDK LanguageModel; the agents stay
// ignorant of the provider (same idea as getAdapter for databases).
//
// Default / free tier: no choice or no key ⇒ our OpenRouter env key + default
// model. BYOK: the user's own provider + key, routed natively to that provider.
export function getLanguageModel(choice?: ModelChoice): LanguageModel {
  if (!choice || !choice.apiKey) {
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    return openrouter(choice?.model ?? process.env.OPENROUTER_DEFAULT_MODEL ?? "openrouter/free");
  }

  const { provider, model, apiKey } = choice;
  switch (provider) {
    case "openrouter":
      return createOpenRouter({ apiKey })(model);
    case "anthropic":
      return createAnthropic({ apiKey })(model);
    case "openai":
      return createOpenAI({ apiKey })(model);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(model);
    case "xai":
      return createXai({ apiKey })(model);
    case "deepseek":
      return createDeepSeek({ apiKey })(model);
  }
}
