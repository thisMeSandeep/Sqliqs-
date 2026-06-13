import { Dashboard } from "@/components/dashboard/dashboard";

// Auth-gated (proxy.ts protects /dashboard). The project list itself is
// client-side — it lives in the user's IndexedDB, not on our server — so the
// Dashboard component owns the whole screen, including its top bar.
export default function DashboardPage() {
  return <Dashboard />;
}
