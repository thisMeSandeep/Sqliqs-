import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

// Shared dark, centered shell for the 404 and route-error pages. Palette is
// inlined (not theme tokens) so these render correctly regardless of theme, and
// even on pages outside the dashboard. `glyph` is the big focal element (a code
// like "404", or an icon). Actions are passed as children so each page can wire
// its own buttons (the error page needs a client reset handler).
export function ErrorScreen({
  glyph,
  title,
  description,
  children,
}: {
  glyph: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center text-[#E5E5E5] antialiased">
      <Link href="/" className="absolute top-6 left-6">
        <Logo className="text-[15px]" />
      </Link>

      <div className="mb-4">{glyph}</div>
      <h1 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-md text-[#888888] leading-relaxed">{description}</p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
    </div>
  );
}

// The oversized gradient number/word used as the focal glyph.
export function ErrorGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-[#34E0A1] via-[#2EE0B8] to-[#22D3EE] bg-clip-text font-semibold text-7xl text-transparent tracking-tight tabular-nums sm:text-8xl">
      {children}
    </span>
  );
}
