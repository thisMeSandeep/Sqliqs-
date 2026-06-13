Sqliqs is built so that your data and credentials stay with you. This policy explains exactly what we do — and, more importantly, don't do — with your information.

## The short version

- We never store your database connection strings, API keys, or query results on our servers.
- Those live only in your own browser, and are sent over an encrypted connection solely to run the request you asked for.
- Every query we generate is **read-only** — Sqliqs cannot change or delete your data.
- We don't sell your data, run ad trackers, or build a profile on you.

## What stays on your device

Sqliqs is a bring-your-own-key (BYOK) tool. The following are stored **only in your browser** (via IndexedDB) and never transmitted to or saved on our servers:

- **Database connection strings** for the databases you connect.
- **LLM API keys** for the model provider you choose.
- **Projects, chat history, settings, and saved sessions.**

Because this data lives in your browser, clearing your browser storage permanently removes it, and it does not sync between devices.

## What passes through our servers

To answer a question, your browser sends the connection string, your API key, and your prompt to our backend **for that single request only**. We use them in memory to:

1. Run a read-only query against your database, and
2. Forward your prompt to your chosen LLM provider using your key.

We do **not** persist, cache, or log these credentials or your data after the request completes. Everything travels over TLS (HTTPS) end to end.

## No accounts

Sqliqs has no sign-up and no login. There are no user accounts, and we never collect your name, email, or any profile information. You just open the app and connect a database — everything is tied to your browser, not to an identity we hold.

## Third parties your data reaches

- **Your LLM provider** (e.g. OpenRouter, Anthropic, OpenAI, Google, xAI, DeepSeek) — receives your prompt and schema context to generate a response, billed to your own key.
- **Your database** — receives the read-only queries Sqliqs generates.

Each operates under its own terms and privacy policy. Sqliqs is not responsible for how these third parties process data once it reaches them.

## The Playground

The public Playground runs against a hosted sample database with a shared free model, so you can try Sqliqs without logging in or supplying a key. It contains only dummy data — please don't enter real or sensitive information there.

## Cookies

Sqliqs doesn't use tracking or advertising cookies, and since there are no accounts, no authentication or session cookies either. Your data is kept in your browser's local storage, not in cookies.

## Changes to this policy

We may update this policy as the product evolves. Material changes will be reflected by the "Last updated" date at the top of this page.

