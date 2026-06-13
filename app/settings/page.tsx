import { SettingsView } from "@/components/settings/settings-view";

// Global settings (auth-gated via proxy.ts). Client-side — model default and
// data live in the user's IndexedDB, not on our server.
export default function SettingsPage() {
  return <SettingsView />;
}
