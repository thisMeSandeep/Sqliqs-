import { nanoid } from "nanoid";
import { getDb, type Project } from "./db";
import { deleteProjectSessions } from "./history";

export async function listProjects(): Promise<Project[]> {
  const db = await getDb();
  const all = await db.getAll("projects");
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDb();
  return db.get("projects", id);
}

type NewProject = Pick<Project, "name" | "db" | "model">;

export async function createProject(input: NewProject): Promise<Project> {
  const now = Date.now();
  const project: Project = { id: nanoid(), ...input, createdAt: now, updatedAt: now };
  const db = await getDb();
  await db.put("projects", project);
  return project;
}

type ProjectPatch = Partial<Pick<Project, "name" | "db" | "model">>;

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project> {
  const db = await getDb();
  const existing = await db.get("projects", id);
  if (!existing) throw new Error(`Project ${id} not found`);
  const updated: Project = { ...existing, ...patch, updatedAt: Date.now() };
  await db.put("projects", updated);
  return updated;
}

export function renameProject(id: string, name: string): Promise<Project> {
  return updateProject(id, { name });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("projects", id);
  await deleteProjectSessions(id);
}
