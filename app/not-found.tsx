import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { ErrorScreen, ErrorGlyph } from "@/components/error-states/error-screen";
import { primaryCta, ghostCta } from "@/components/landing/shared";

export default function NotFound() {
  return (
    <ErrorScreen
      glyph={<ErrorGlyph>404</ErrorGlyph>}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved. Let's get you back to your data."
    >
      <Link href="/" className={primaryCta}>
        Back home
      </Link>
      <Link href="/playground" className={ghostCta}>
        Open the Playground
        <ArrowRightIcon className="size-4" />
      </Link>
    </ErrorScreen>
  );
}
