import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Dashboard } from "@/components/dashboard/dashboard";

// Auth-gated (proxy.ts protects /dashboard). The project list itself is
// client-side — it lives in the user's IndexedDB, not on our server.
export default function DashboardPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/" className="font-semibold">
          Talkql
        </Link>
        <UserButton />
      </header>
      <div className="flex-1">
        <Dashboard />
      </div>
    </main>
  );
}
