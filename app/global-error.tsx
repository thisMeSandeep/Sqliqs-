"use client";

import { useEffect } from "react";

// Catastrophic fallback: replaces the root layout when it (or providers) throw,
// so it must render its own <html>/<body> and cannot rely on the app's
// stylesheet or fonts being present. Everything is styled inline to stay robust.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const font =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "24px",
          textAlign: "center",
          background: "#0A0A0A",
          color: "#E5E5E5",
          fontFamily: font,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden style={{ height: "18px", width: "auto" }} />
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              backgroundImage: "linear-gradient(90deg, #34E0A1, #2EE0B8, #22D3EE)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Sqliqs
          </span>
        </span>

        <h1
          style={{
            margin: "28px 0 0",
            fontSize: "32px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#ffffff",
          }}
        >
          Something broke
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            maxWidth: "28rem",
            lineHeight: 1.6,
            color: "#888888",
          }}
        >
          A critical error stopped the app from loading. Reloading usually fixes it — if it keeps
          happening, please try again shortly.
        </p>

        <div style={{ marginTop: "36px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: font,
              background: "#52E8A2",
              color: "#0A0A0A",
            }}
          >
            Try again
          </button>
          {/* Hard navigation on purpose: the app tree has crashed, so we want a
              full reload, not client-side routing. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              borderRadius: "6px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              border: "1px solid #2A2A2A",
              color: "#E5E5E5",
            }}
          >
            Back home
          </a>
        </div>
      </body>
    </html>
  );
}
