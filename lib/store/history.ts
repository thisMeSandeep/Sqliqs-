import { nanoid } from "nanoid";
import { getDb, type Session, type Surface } from "./db";

export function newSession(projectId: string, surface: Surface, title: string): Session {
  return { id: nanoid(), projectId, surface, title, messages: [], createdAt: Date.now() };
}

export async function listSessions(projectId: string): Promise<Session[]> {
  const db = await getDb();
  const rows = await db.getAllFromIndex("sessions", "byProject", projectId);
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDb();
  return db.get("sessions", id);
}

// Upsert — the surfaces save the running session as messages stream in.
export async function saveSession(session: Session): Promise<void> {
  const db = await getDb();
  await db.put("sessions", session);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("sessions", id);
}

export async function deleteProjectSessions(projectId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("sessions", "readwrite");
  const index = tx.store.index("byProject");
  for await (const cursor of index.iterate(projectId)) {
    await cursor.delete();
  }
  await tx.done;
}
