import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared landing-page primitives + the strict palette, kept in one place so
// every section stays on the same rhythm. Palette is deliberate and closed:
// #0A0A0A bg · #161616 surface · #222 border · #888 muted · #E5E5E5 text ·
// #52E8A2 accent. Nothing else. Colors are inlined (not theme tokens) so the
// page renders identically regardless of the app's light/dark class.

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}

// Mint uppercase eyebrow that opens most sections.
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-medium text-[0.7rem] text-[#52E8A2] uppercase tracking-[0.22em]">
      {children}
    </p>
  );
}

// One display size, one heading size, one body size — enforced as helpers so no
// section drifts into its own scale.
export function Display({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "font-medium text-4xl text-white leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function Heading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-medium text-3xl text-white tracking-tight sm:text-4xl", className)}>
      {children}
    </h2>
  );
}

export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[#888888] leading-relaxed", className)}>{children}</p>;
}

// CTA class strings — used on Links and Clerk button wrappers alike.
export const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#52E8A2] px-5 py-2.5 font-medium text-[#0A0A0A] text-sm transition-colors hover:bg-[#6BEEB2]";

export const ghostCta =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#2A2A2A] px-5 py-2.5 font-medium text-[#E5E5E5] text-sm transition-colors hover:border-[#3A3A3A] hover:bg-white/[0.03]";
