import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DbKind } from "@/lib/db/types";
import type { ModelChoice } from "@/lib/ai/types";

// All project data lives here, in the user's browser — never on our server.
// This is the zero-data-liability promise made concrete (PRODUCT-SCOPE).

export type Project = {
  id: string;
  name: string;
  db: { kind: DbKind; connectionString: string };
  // null ⇒ inherit the global default settings.
  model: ModelChoice | null;
  createdAt: number;
  updatedAt: number;
};

export type GlobalSettings = {
  id: "global"; // singleton key
  model: ModelChoice;
};

export type Surface = "chat" | "visualization" | "reports";

export type Session = {
  id: string;
  projectId: string;
  surface: Surface;
  title: string;
  messages: unknown[]; // UIMessage[] for chat/reports; the surfaces own the shape
  createdAt: number;
};

interface TalkqlDB extends DBSchema {
  projects: { key: string; value: Project };
  settings: { key: string; value: GlobalSettings };
  sessions: { key: string; value: Session; indexes: { byProject: string } };
}

const DB_NAME = "talkql";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TalkqlDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<TalkqlDB>> {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  dbPromise ??= openDB<TalkqlDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        const sessions = db.createObjectStore("sessions", { keyPath: "id" });
        sessions.createIndex("byProject", "projectId");
      }
    },
  });
  return dbPromise;
}

// The user's escape hatch — wipes every project, setting, and session. Browser
// data is the user's responsibility (PRODUCT-SCOPE), so we give them one button.
export async function clearAll(): Promise<void> {
  const db = await getDb();
  await Promise.all([db.clear("projects"), db.clear("settings"), db.clear("sessions")]);
}
