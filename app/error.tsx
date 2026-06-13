"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { ErrorScreen } from "@/components/error-states/error-screen";
import { primaryCta, ghostCta } from "@/components/landing/shared";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging; we don't log user data here.
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      glyph={
        <span className="grid size-20 place-items-center rounded-2xl border border-[#52E8A2]/20 bg-[#52E8A2]/10">
          <TriangleAlertIcon className="size-9 text-[#52E8A2]" strokeWidth={1.5} />
        </span>
      }
      title="Something went wrong"
      description="An unexpected error interrupted this page. You can try again, or head back and pick up where you left off."
    >
      <button type="button" onClick={reset} className={primaryCta}>
        <RotateCcwIcon className="size-4" />
        Try again
      </button>
      <Link href="/" className={ghostCta}>
        Back home
      </Link>
    </ErrorScreen>
  );
}
