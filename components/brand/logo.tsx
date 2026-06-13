import { cn } from "@/lib/utils";


export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 align-middle", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" aria-hidden className="h-[1.15em] w-auto" />
      <span className="bg-gradient-to-r from-[#34E0A1] via-[#2EE0B8] to-[#22D3EE] bg-clip-text font-semibold tracking-tight text-transparent">
        Sqliqs
      </span>
    </span>
  );
}
