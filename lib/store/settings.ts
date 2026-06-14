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

// Strip every saved provider key — the global default plus all per-project
// overrides — without deleting projects, settings, or history. Provider/model
// selections are kept; only `apiKey` is removed, so surfaces fall back to the
// free tier. Returns how many keys were cleared.
export async function clearStoredKeys(): Promise<number> {
  const db = await getDb();
  let removed = 0;

  const global = await db.get("settings", GLOBAL_KEY);
  if (global?.model.apiKey) {
    const model = { ...global.model };
    delete model.apiKey;
    await db.put("settings", { ...global, model });
    removed++;
  }

  const projects = await db.getAll("projects");
  await Promise.all(
    projects.map(async (project) => {
      if (!project.model?.apiKey) return;
      const model = { ...project.model };
      delete model.apiKey;
      await db.put("projects", { ...project, model });
      removed++;
    })
  );

  return removed;
}
