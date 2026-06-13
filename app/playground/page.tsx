import Link from "next/link";
import { Workspace } from "@/components/project/workspace";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

// Public, no-login sandbox: the full product against our hosted sample DB with
// our default OpenRouter key. The one sanctioned exception to "login required".
export default function PlaygroundPage() {
  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="font-semibold">
            <Logo /> <span className="text-foreground">Playground</span>
          </h1>
          <p className="text-muted-foreground text-xs">
            Sample database · no login, no key required
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
    </main>
  );
}
