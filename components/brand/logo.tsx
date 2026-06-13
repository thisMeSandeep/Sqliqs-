import { cn } from "@/lib/utils";

// The Sqliqs wordmark — a mint→cyan gradient clipped to the text. Reads on both
// light and dark backgrounds (both stops are mid-tone), so it's the single brand
// mark used everywhere: landing, dashboard, playground, settings.
//
// Size is controlled by the caller via `className` (font-size, tracking); the
// gradient + weight default lives here. Wrap in a <Link> at the call site when
// it needs to be clickable.
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-[#34E0A1] via-[#2EE0B8] to-[#22D3EE] bg-clip-text font-semibold tracking-tight text-transparent",
        className
      )}
    >
      Sqliqs
    </span>
  );
}
