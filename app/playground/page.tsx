import type { Metadata } from "next";
import Link from "next/link";
import { Workspace } from "@/components/project/workspace";
import { PlaygroundNotice } from "@/components/project/playground-notice";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Try Sqliqs instantly against a hosted sample database — no login, no key, no setup. Ask questions in plain English.",
  alternates: { canonical: "/playground" },
};

// Public, no-login sandbox: the full product against our hosted sample DB with
// our default OpenRouter key.
export default function PlaygroundPage() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="font-semibold">
            <Logo /> <span className="text-foreground">Playground</span>
          </h1>
          <p className="text-muted-foreground text-xs">
            Sample database <span>  </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard">Connect your database</Link>
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Workspace />
      </div>
      <PlaygroundNotice />
    </main>
  );
}
