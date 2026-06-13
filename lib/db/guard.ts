// Read-only safety lives at the seam — the one place queries execute. Every
// adapter's runQuery calls assertReadOnly before touching the database, and
// also runs inside the engine's own read-only mode for real enforcement.
// These shared limits are the guardrails the scope's security table promises.

// Hard cap on rows returned to the LLM. Kept low on purpose: feeding hundreds
// of raw rows into the context just invites hallucination. The agent is
// prompted to COUNT first, then fetch an optimal slice (≤ this) only if it
// actually needs rows — aggregates return few rows and run freely.
export const MAX_ROWS = 100;
export const QUERY_TIMEOUT_MS = 10000;

// Statements that write or change structure. Matched as whole words so a
// column named "updated_at" or a value like 'created' doesn't trip the guard.
const WRITE_KEYWORDS =
  /\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|replace|merge|comment|call|do|copy|vacuum|reindex|cluster|lock|set|reset)\b/i;

export function assertReadOnly(query: string): void {
  const trimmed = stripComments(query).trim();

  if (!trimmed) {
    throw new Error("Empty query");
  }

  // One statement only — block stacked queries like "SELECT ...; DELETE ...".
  const withoutTrailing = trimmed.replace(/;\s*$/, "");
  if (withoutTrailing.includes(";")) {
    throw new Error("Only a single statement is allowed");
  }

  if (WRITE_KEYWORDS.test(withoutTrailing)) {
    throw new Error("Only read-only queries are allowed");
  }
}

// Strip -- line comments and /* */ block comments so a keyword hidden in a
// comment can't sneak past (or trip) the check.
function stripComments(query: string): string {
  return query
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ");
}
