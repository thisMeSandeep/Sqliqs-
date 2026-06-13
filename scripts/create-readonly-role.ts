import postgres from "postgres";
import { randomBytes } from "node:crypto";

// One-off: create a SELECT-only Postgres role on the sample DB so the
// playground connects with least privilege (defense-in-depth on top of the
// app's read-only guard). Run with the OWNER connection string in DATABASE_URL;
// it prints a ready-to-paste read-only connection string for DATABASE_URL and
// reminds you to keep the owner string as SEED_DATABASE_URL for re-seeding.
const ownerUrl = process.env.SEED_DATABASE_URL ?? process.env.DATABASE_URL;
if (!ownerUrl) {
  console.error("Set DATABASE_URL (owner role) before running this script.");
  process.exit(1);
}

const ROLE = "talkql_readonly";
// Alphanumeric only — no URL-encoding surprises when pasted into a URL.
const password = randomBytes(24).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);

const sql = postgres(ownerUrl);

async function run() {
  const [{ db }] = await sql<{ db: string }[]>`SELECT current_database() AS db`;

  // Create-or-reset the login role with a fresh password.
  await sql.unsafe(`
    DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_roles WHERE rolname = '${ROLE}') THEN
        ALTER ROLE ${ROLE} WITH LOGIN PASSWORD '${password}';
      ELSE
        CREATE ROLE ${ROLE} WITH LOGIN PASSWORD '${password}';
      END IF;
    END $$;
  `);

  // Read-only grants: connect + read existing and future tables, nothing else.
  await sql.unsafe(`GRANT CONNECT ON DATABASE "${db}" TO ${ROLE}`);
  await sql.unsafe(`GRANT USAGE ON SCHEMA public TO ${ROLE}`);
  await sql.unsafe(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${ROLE}`);
  await sql.unsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${ROLE}`);
  // Make sure it can't create objects in the schema.
  await sql.unsafe(`REVOKE CREATE ON SCHEMA public FROM ${ROLE}`);

  // Build the read-only connection string by swapping creds into the owner URL.
  const u = new URL(ownerUrl!);
  u.username = ROLE;
  u.password = password;

  console.log(`\n✅ Read-only role "${ROLE}" is ready (SELECT only).\n`);
  console.log("Put THIS in .env.local as your playground connection:\n");
  console.log(`DATABASE_URL=${u.toString()}\n`);
  console.log("Keep your existing OWNER string for re-seeding:\n");
  console.log("SEED_DATABASE_URL=<your current owner connection string>\n");

  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
