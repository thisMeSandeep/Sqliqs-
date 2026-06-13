"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// Thin wrapper so the (server) root layout can mount next-themes, which must run
// on the client. Toggles the `.dark` class on <html> — the design tokens in
// globals.css already define both palettes.
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
