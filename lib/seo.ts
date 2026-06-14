// Single source of truth for site-wide SEO constants, shared by the layout,
// manifest, robots, sitemap, and OG image. Override the URL per environment via
// NEXT_PUBLIC_SITE_URL (falls back to the production domain).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://sqliqs.com";

export const APP_NAME = "Sqliqs";
export const APP_TITLE = "Sqliqs — Ask your database in plain English";
export const DESCRIPTION =
  "Ask your database in plain English and get answers, charts, and reports. No SQL, no setup — bring your own key. Works with PostgreSQL, MySQL, SQLite, and MongoDB.";
