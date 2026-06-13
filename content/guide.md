Sqliqs lets you ask questions about your database in plain English — no SQL required. This guide walks through how to get the best results, how to keep your data safe, and the limits worth knowing before you rely on it.

## Getting started

You have two ways in:

- **Playground** — try Sqliqs instantly against a hosted sample database. No login, no key, no setup. Great for seeing how it works.
- **Your own database** — open the dashboard, create a project, and paste a connection string for PostgreSQL, MySQL, SQLite, or MongoDB. No sign-up required, and your connection details stay in your browser.

Once connected, open a project and start asking questions.

## Pick a model and add your key

Sqliqs is **bring-your-own-key (BYOK)**. In a project's settings you choose:

- A **provider** (OpenRouter, Anthropic, OpenAI, Google, xAI, or DeepSeek), and
- A **model** from that provider, paired with your own API key.

You can also start with the **built-in free model** — no key needed — but it's rate-limited and slower (see [Limitations](#limitations)). For real work, add your own key.

> **Better model, better answers.** More capable models write more accurate queries, handle complex schemas, and reason over your data far better. If answers feel shallow or a query looks wrong, switch to a stronger model.

## Asking good questions

The clearer your question, the better the query Sqliqs writes:

- **Be specific.** "What was total revenue by month in 2025?" beats "show me revenue."
- **Name things when you can.** Referencing the table or column you mean helps the model target the right data.
- **Ask for what you want to see.** Say "show me the rows / give me a table" to get a table, or "chart this" to get a visualization.
- **Follow up.** Chat keeps context, so you can drill in: "now break that down by region."

## The four surfaces

- **Chat** — ask questions and get plain-English answers, with the query and result table shown alongside.
- **Visualization** — describe what you want to see; Sqliqs picks the chart type and fills it with your data.
- **Reports** — ask for a report in one sentence and get a formatted document with narrative, tables, and charts.
- **ER Diagram** — an auto-generated map of your tables, columns, and relationships, exportable as SVG or PNG.

## Keeping your data safe

- **Read-only by design.** Every query Sqliqs generates is read-only — it cannot insert, update, or delete your data.
- **Use a read-only database user.** For defense in depth, connect with a database role that only has `SELECT` permission. Then even a bug can't touch your data.
- **Your keys stay with you.** API keys and connection strings live only in your browser and are sent over an encrypted connection per request — never stored on our servers. See the [Privacy Policy](/privacy).
- **Don't share your keys.** Treat your API keys like passwords. Rotate them with your provider if one is exposed.

## Limitations

A few things to understand before you depend on Sqliqs:

- **Storage is local to your browser.** Projects, chat history, settings, and keys are saved in this browser's local storage (IndexedDB). There is **no cloud storage** and **no sync**.
- **No cross-browser or cross-device access.** Open Sqliqs in a different browser, profile, or device and your projects won't be there. Clearing your browser data erases them permanently.
- **The free model is limited.** The built-in free model has a small daily request cap and slower responses. It's for trying things out — bring your own key for sustained or heavy use.
- **Results are capped.** Queries return a limited number of rows, so for large datasets Sqliqs prefers summaries and aggregates over dumping raw rows.
- **AI can be wrong.** Models occasionally write a query that doesn't match your intent. The query is always shown — glance at it, and verify anything important.

## Tips for the best experience

- Back up anything you want to keep — export reports and diagrams, since history isn't synced.
- Start a new chat for a new topic to keep context focused.
- For analysis over big tables, ask for aggregates ("average", "count by…") rather than every row.
- If a response is cut off or errors out, try again or switch to a model with more capacity.


