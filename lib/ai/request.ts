import type { ConnectionConfig } from "./types";

// The per-request fields the surfaces send. Undefined ⇒ playground defaults
// (sample DB + free model) on the server. The schema route ignores `model`.
export function toRequestBody(config?: ConnectionConfig) {
  if (!config) return undefined;
  return {
    kind: config.kind,
    connectionString: config.connectionString,
    model: config.model,
  };
}
