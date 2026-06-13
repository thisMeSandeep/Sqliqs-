import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/landing/shared";

// Reusable Astro-style content page: author the body in a Markdown file, render
// it to HTML here inside a typographic `prose` shell. Server-rendered, no client
// JS. Reuses the landing nav + footer so these pages match the marketing site
// and stay dark-only. Used for Privacy, the user Guide, Pricing, etc.
export function MarkdownPage({
  title,
  subtitle,
  content,
}: {
  title: string;
  subtitle?: string;
  content: string;
}) {
  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-[#E5E5E5] antialiased">
      <Navbar />
      <Container className="py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-medium text-4xl text-white tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-[#888888] text-sm">{subtitle}</p>}
          <article
            className={[
              "prose prose-invert mt-12 max-w-none",
              "prose-headings:font-medium prose-headings:text-white prose-headings:tracking-tight",
              "prose-p:text-[#B5B5B5] prose-li:text-[#B5B5B5]",
              "prose-strong:text-[#E5E5E5]",
              "prose-a:text-[#52E8A2] prose-a:no-underline hover:prose-a:underline",
              "prose-li:marker:text-[#52E8A2]",
              "prose-hr:border-[#222222]",
              "prose-code:text-[#52E8A2] prose-code:before:content-none prose-code:after:content-none",
            ].join(" ")}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
