import { cn } from "@/lib/utils";

const GRADIENT = "#34E0A1, #2EE0B8, #22D3EE";

// A branded, "thinking" loader: two counter-rotating gradient arcs around a
// pulsing core, wrapped in a soft glow. Tuned to feel like the model is at work
// rather than a generic spinner.
export function Loader({
  size = 40,
  className,
  label,
}: {
  /** Diameter of the orb in pixels. */
  size?: number;
  className?: string;
  /** Optional caption rendered under the orb (also used as the a11y label). */
  label?: string;
}) {
  const stroke = Math.max(2, Math.round(size * 0.08));
  // Carve a ring out of a filled circle.
  const ringMask = `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px))`;
  const innerStroke = Math.max(2, Math.round(size * 0.06));
  const innerRingMask = `radial-gradient(farthest-side, transparent calc(100% - ${innerStroke}px), #000 calc(100% - ${innerStroke}px))`;

  return (
    <div
      data-slot="loader"
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex flex-col items-center gap-3", className)}
    >
      <span
        className="relative block"
        style={{ width: size, height: size }}
      >
        {/* Soft glow halo */}
        <span
          aria-hidden
          className="absolute inset-0 animate-loader-pulse rounded-full blur-md"
          style={{ background: `conic-gradient(from 90deg, ${GRADIENT}, ${GRADIENT.split(", ")[0]})`, opacity: 0.4 }}
        />
        {/* Outer gradient arc */}
        <span
          aria-hidden
          className="absolute inset-0 animate-loader-spin rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, #34E0A1 110deg, #2EE0B8 210deg, #22D3EE 320deg, transparent 360deg)`,
            mask: ringMask,
            WebkitMask: ringMask,
          }}
        />
        {/* Inner counter-rotating arc */}
        <span
          aria-hidden
          className="absolute inset-[18%] animate-loader-spin-rev rounded-full"
          style={{
            background: `conic-gradient(from 180deg, transparent 0deg, #22D3EE 140deg, transparent 300deg)`,
            mask: innerRingMask,
            WebkitMask: innerRingMask,
          }}
        />
        {/* Pulsing core */}
        <span
          aria-hidden
          className="absolute inset-[36%] animate-loader-pulse rounded-full"
          style={{ background: `linear-gradient(135deg, #34E0A1, #22D3EE)` }}
        />
      </span>
      {label ? (
        <span className="animate-loader-pulse text-muted-foreground text-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}

// Full-viewport centered loader for route- and page-level loading states.
export function LoaderScreen({ label }: { label?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <Loader size={56} label={label} />
    </main>
  );
}
