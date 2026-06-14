import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "./shared";

// Minimal sticky nav. Solid background (no blur, per the brief), a single 1px
// bottom border dividing it from the hero.
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-[#222222] border-b bg-[#0A0A0A]">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/">
          <Logo className="text-[15px]" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/playground"
            className="text-[#888888] text-sm transition-colors hover:text-[#E5E5E5]"
          >
            Playground
          </Link>
          <Link
            href="/guide"
            className="text-[#888888] text-sm transition-colors hover:text-[#E5E5E5]"
          >
            Guide
          </Link>
          <Link
            href="/pricing"
            className="text-[#888888] text-sm transition-colors hover:text-[#E5E5E5]"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-[#52E8A2] px-3.5 py-1.5 font-medium text-[#0A0A0A] text-sm transition-colors hover:bg-[#6BEEB2]"
          >
            Open Dashboard
          </Link>

          <a
            href="https://github.com/thisMeSandeep/Sqliqs-"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Give us a star on GitHub"
            className="group relative flex size-9 items-center justify-center rounded-md border border-[#222222] text-[#888888] transition-colors hover:border-[#333333] hover:text-[#E5E5E5]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/github.svg"
              alt=""
              aria-hidden
              className="size-5 opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span className="pointer-events-none absolute top-full right-0 mt-2 whitespace-nowrap rounded-md border border-[#222222] bg-[#161616] px-2.5 py-1 text-[#E5E5E5] text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              Give us a star
            </span>
          </a>
        </div>
      </Container>
    </header>
  );
}
