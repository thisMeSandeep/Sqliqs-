import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Guide — Talkql",
  description: "How to use Talkql effectively, keep your data safe, and what to know about its limits.",
};

export default async function GuidePage() {
  const content = await readFile(join(process.cwd(), "content/guide.md"), "utf8");
  return (
    <MarkdownPage
      title="User Guide"
      subtitle="How to get the most out of Talkql."
      content={content}
    />
  );
}
