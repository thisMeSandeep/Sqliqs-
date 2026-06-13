import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { MarkdownPage } from "@/components/content/markdown-page";

export const metadata: Metadata = {
  title: "Pricing — Sqliqs",
  description: "Sqliqs is free — you bring your own model key and pay your provider directly.",
};

export default async function PricingPage() {
  const content = await readFile(join(process.cwd(), "content/pricing.md"), "utf8");
  return (
    <MarkdownPage
      title="Free. No paywalls. Ever."
      subtitle="You bring your own key and pay your provider directly — never us."
      content={content}
    />
  );
}
