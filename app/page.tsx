import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// Minimal index for now — just the auth entry points and a way into the public
// Playground. The full marketing landing page comes at the end of the project.
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold text-lg">Talkql</span>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="max-w-xl space-y-3">
          <h1 className="font-bold text-4xl tracking-tight">Talk to your database.</h1>
          <p className="text-muted-foreground">
            Query your data in plain English — bring your own database, bring your own key.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/playground">Try the Playground</Link>
          </Button>
          <Show when="signed-out">
            <SignUpButton>
              <Button variant="outline" size="lg">
                Connect your database
              </Button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </main>
  );
}
