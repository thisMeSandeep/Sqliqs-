import { getDb } from "./db";
import type { ModelChoice } from "@/lib/ai/types";
import type { Project } from "./db";

const GLOBAL_KEY = "global" as const;

// The default until the user sets anything: our built-in free OpenRouter model.
export const FREE_MODEL_CHOICE: ModelChoice = {
  provider: "openrouter",
  model: "openrouter/free",
};

export async function getGlobalSettings(): Promise<ModelChoice> {
  const db = await getDb();
  const row = await db.get("settings", GLOBAL_KEY);
  return row?.model ?? FREE_MODEL_CHOICE;
}

export async function setGlobalSettings(model: ModelChoice): Promise<void> {
  const db = await getDb();
  await db.put("settings", { id: GLOBAL_KEY, model });
}

// A project's model is its own override, or the global default when it inherits.
export async function resolveModel(project: Project): Promise<ModelChoice> {
  return project.model ?? (await getGlobalSettings());
}
