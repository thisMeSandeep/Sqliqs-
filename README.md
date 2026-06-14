<div align="center">

# Sqliqs

**Ask your database in plain English — get answers, charts, and reports. No SQL, no setup.**

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-34E0A1.svg)](#contributing)
[![License: MIT](https://img.shields.io/badge/License-MIT-22D3EE.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000.svg?logo=next.js)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-1.3+-fbf0df.svg?logo=bun)](https://bun.sh)
[![Made with AI SDK](https://img.shields.io/badge/AI%20SDK-v6-2EE0B8.svg)](https://sdk.vercel.ai)

[Live demo](https://sqliqs.com/playground) · [Report a bug](https://github.com/thisMeSandeep/Sqliqs-/issues/new) · [Request a feature](https://github.com/thisMeSandeep/Sqliqs-/issues/new)

</div>

Sqliqs is a bring-your-own-key (BYOK), **local-first** tool for querying any database in natural language. Connect a database, ask a question the way you'd say it out loud, and Sqliqs writes the read-only query, runs it, and answers — with a result table, an instant chart, a full written report, or an auto-generated ER diagram.

<p align="center">
  <img src="public/feature-pictures/chat.png" alt="Sqliqs answering a natural-language question with a result table" width="820" />
</p>

> **No accounts. No backend storage. No tracking.** Your connection strings and API keys live only in your browser and are sent per request over HTTPS — never persisted or logged server-side.

---

## Table of contents

- [Features](#features)
- [Try it](#try-it)
- [Supported databases & providers](#supported-databases--providers)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Security](#security)
- [Privacy](#privacy)
- [License](#license)

## Features

- **💬 Chat with your data** — ask questions and follow-ups; get a plain-English answer alongside the generated query and result table. History is saved locally.
- **📊 Visualize instantly** — describe what you want to see; Sqliqs picks the chart type and fills it with your data. Export as PNG/SVG.
- **📄 Full reports** — ask for a report in one sentence and get a formatted document with narrative, tables, and embedded charts. Export to Markdown, CSV, or PDF.
- **🗺️ ER diagrams** — every connected database gets an auto-generated schema map you can export as SVG or PNG.
- **🔒 Read-only by design** — every generated query is validated read-only *and* executed in the engine's read-only mode; Sqliqs can't insert, update, or delete.
- **🔑 Bring your own key** — use your own model provider key, or start with the built-in free model. Keys and connection strings stay in your browser.
- **🧪 Public Playground** — try the whole product against a hosted sample database with no login and no key.
- **📱 Installable PWA** — add it to your home screen; dark-mode, responsive UI.

## Try it

- **Hosted Playground:** [sqliqs.com/playground](https://sqliqs.com/playground) — full product against a sample database, no setup.
- **Run it locally:** see [Getting started](#getting-started).

## Supported databases & providers

| Databases | AI providers |
| --- | --- |
| PostgreSQL · MySQL/MariaDB · SQLite (incl. [Turso](https://turso.tech)) · MongoDB | OpenRouter (free model) · Anthropic · OpenAI · Google · xAI · DeepSeek |

Adding a new database or provider is a small, well-isolated change — see [Architecture](#architecture) and [Contributing](#contributing).

## How it works

1. **Connect** a database with a connection string (stays in your browser).
2. **Pick a model** and bring your key — or start with the built-in free model.
3. **Ask** in plain English. Sqliqs reads your schema and writes a read-only query.
4. **Get** answers, charts, reports, and diagrams.

Projects, settings, chat history, keys, and connection strings are stored locally in the browser (IndexedDB). Per request, your connection string and key are sent over HTTPS to execute the query and call your chosen model — and nothing is kept afterward.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, React 19, React Compiler) on **[Bun](https://bun.sh)**
- **[Vercel AI SDK v6](https://sdk.vercel.ai)** with native provider clients (Anthropic, OpenAI, Google, xAI, DeepSeek, OpenRouter)
- **Tailwind CSS v4** + **[shadcn/ui](https://ui.shadcn.com)**, **[Streamdown](https://streamdown.ai)** for markdown, **[Recharts](https://recharts.org)** for charts, **[React Flow](https://reactflow.dev)** for ER diagrams
- **[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)** (via `idb`) for local-first storage
- Database drivers: `pg`/`postgres`, `mysql2`, `@libsql/client`, `mongodb`

## Getting started

**Prerequisites:** [Bun](https://bun.sh) `v1.3+`.

```bash
# 1. Clone
git clone https://github.com/thisMeSandeep/Sqliqs-.git
cd Sqliqs-

# 2. Install dependencies
bun install

# 3. Configure environment (see below)
cp .env.example .env.local   # then fill in the values

# 4. Seed the sample database used by the Playground
bun seed

# 5. Start the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Just want to poke at the UI?** You can skip the database/key setup and explore the landing pages and flows — only the Playground and live queries need the env vars below.

## Environment variables

These power the public **Playground** only. User projects supply their own connection strings and model keys through the UI (stored in the browser) — those are never read from the environment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connection string for the Playground's sample database. Use a **read-only** role at runtime. |
| `OPENROUTER_API_KEY` | ✅ | Key for the built-in free model the Playground uses. |
| `SEED_DATABASE_URL` | for seeding | Owner/write role used by `bun seed`. Falls back to `DATABASE_URL` if unset. |
| `OPENROUTER_DEFAULT_MODEL` | optional | Override the default free model id. |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical site URL for SEO/OG tags (defaults to the production domain). |

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server |
| `bun run build` | Production build |
| `bun start` | Run the production build |
| `bun run lint` | Lint with ESLint |
| `bun seed` | (Re)seed the sample database |
| `bun scripts/gen-icons.mjs` | Regenerate the PWA/app icon set from `public/logo.svg` |

## Project structure

```
app/            Routes — landing, /playground, /dashboard, /projects, /settings, content pages, /api
components/     UI — landing/, dashboard/, project/, chat/, visualization/, reports/, er-diagram/, brand/
content/        Markdown for the Guide, Pricing, and Privacy pages
lib/
  ai/           Provider seam, model catalog, prompts, agents, tools
  db/           Per-engine adapters behind one interface + read-only guard
  store/        IndexedDB stores (projects, settings, sessions)
public/         Logos, provider/database icons, feature screenshots
seed.ts         Idempotent sample-data seeder
```

## Architecture

Two design ideas make Sqliqs easy to extend, and they mirror each other:

**Database seam — `lib/db/`.** Every engine implements one `DatabaseAdapter` interface (`getSchema()` + `runQuery()`), and `getAdapter(kind, connectionString)` is the single factory that picks one. The rest of the app never knows which engine it's talking to. Read-only safety lives in `lib/db/guard.ts` (`assertReadOnly`, row caps, query timeout) and is enforced at the one place queries execute.

**Provider seam — `lib/ai/providers.ts`.** `getLanguageModel(choice)` is the single place that knows which LLM provider we're talking to — give it a `ModelChoice`, get back an AI SDK `LanguageModel`. The agents (`lib/ai/agent.ts`) stay provider-agnostic.

The API routes (`app/api/{chat,visualize,report,schema}`) are thin: they take the per-request connection + model, build an adapter and a model, and stream the agent's result. **No connection or key is stored server-side beyond the single request.**

## Contributing

Contributions are very welcome — issues, docs, bug fixes, and features alike. 🙌

### Getting set up

1. Fork the repo and clone your fork.
2. Follow [Getting started](#getting-started).
3. Create a branch: `git checkout -b feat/short-description`.
4. Before pushing, make sure it's green:
   ```bash
   bun run lint
   bunx tsc --noEmit
   bun run build
   ```
5. Open a PR against `main` with a clear description and screenshots for UI changes.

> Keep changes focused, match the surrounding code style, and add a comment only where the *why* isn't obvious. Conventional-commit-style titles (`feat:`, `fix:`, `docs:`) are appreciated but not required.

### Good first contributions

- **Add a database engine.** Implement a `DatabaseAdapter` in `lib/db/<engine>.ts` (with `runQuery` calling `assertReadOnly`), add the kind to `DbKind` in `lib/db/types.ts`, wire a `case` into `getAdapter` (`lib/db/index.ts`), add metadata/icon (`lib/db/meta.ts` + `public/databases/`), and add it to the connection wizard options.
- **Add an AI provider.** Add the id to `ProviderId` (`lib/ai/types.ts`), a `case` to `getLanguageModel` (`lib/ai/providers.ts`), models to the catalog (`lib/ai/models.ts`), and an icon/meta (`public/providers/`).
- **Improve prompts** in `lib/ai/prompts.ts`, or chart/report heuristics in `lib/ai/charts.ts` / `lib/ai/report-charts.ts`.
- **Docs, examples, and accessibility** fixes are always appreciated.

Browse the [issues](https://github.com/thisMeSandeep/Sqliqs-/issues) (look for `good first issue`) or open a new one to discuss bigger changes first.

## Roadmap

These are directions, not promises — PRs and proposals welcome:

- [ ] More database engines (e.g. SQL Server, BigQuery, ClickHouse, DuckDB)
- [ ] Saveable/shareable queries and dashboards
- [ ] Hardening the public proxy endpoints (SSRF protection, rate limiting) for self-hosters
- [ ] Schema-aware autocomplete and query explanations
- [ ] i18n

## Security

- **Read-only enforcement is layered:** generated queries are validated against a write/DDL keyword guard *and* run in the database's own read-only mode, with row caps and a query timeout (`lib/db/guard.ts`). Still, for defense in depth, **connect with a database role that only has `SELECT`.**
- **BYOK:** keys and connection strings are kept in the browser (IndexedDB) and sent per request over TLS; they are never persisted or logged server-side.
- **Self-hosting note:** the `/api/*` proxy endpoints are unauthenticated by default. Before exposing a public instance, add rate limiting and SSRF protection (don't let arbitrary connection strings reach internal hosts). See the roadmap.
- **Found a vulnerability?** Please **don't** open a public issue — email the maintainer or use GitHub's private security advisories.

## Privacy

No accounts, no tracking. See the in-app [Privacy Policy](content/privacy.md). All app state lives in your browser; clearing site data (or the in-app **Settings → Clear all data**) removes everything.

## License

Released under the **MIT License** — see [`LICENSE`](LICENSE).

## Acknowledgements

Built with [Next.js](https://nextjs.org), the [Vercel AI SDK](https://sdk.vercel.ai), [shadcn/ui](https://ui.shadcn.com), and a lot of open-source shoulders to stand on.

---

<div align="center">
If Sqliqs is useful to you, consider giving it a ⭐ — it helps others find it.
</div>
