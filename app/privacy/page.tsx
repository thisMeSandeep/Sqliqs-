import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sqliqs handles your data, keys, and credentials.",
};

// Astro-style: read the Markdown source from disk at build time and render it as
// HTML. Static — no request-time data, so Next prerenders it.
export default async function PrivacyPage() {
  const content = await readFile(join(process.cwd(), "content/privacy.md"), "utf8");
  return (
    <MarkdownPage title="Privacy Policy" subtitle="Last updated June 13, 2026" content={content} />
  );
}
