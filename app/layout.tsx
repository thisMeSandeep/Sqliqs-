import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://sqliqs.com";
const DESCRIPTION =
  "Ask your database in plain English and get answers, charts, and reports. No SQL, no setup — bring your own key. Works with PostgreSQL, MySQL, SQLite, and MongoDB.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sqliqs — Ask your database in plain English",
    template: "%s · Sqliqs",
  },
  description: DESCRIPTION,
  applicationName: "Sqliqs",
  keywords: [
    "natural language to SQL",
    "query database in plain English",
    "AI SQL",
    "text to SQL",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "MongoDB",
    "BYOK",
    "database chat",
  ],
  authors: [{ name: "Sqliqs" }],
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Sqliqs",
    url: SITE_URL,
    title: "Sqliqs — Ask your database in plain English",
    description: DESCRIPTION,
    images: [{ url: "/logo.png", width: 456, height: 456, alt: "Sqliqs" }],
  },
  twitter: {
    card: "summary",
    title: "Sqliqs — Ask your database in plain English",
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
