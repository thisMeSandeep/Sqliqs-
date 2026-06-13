import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "./shared";

const PRODUCT = [
  { label: "Playground", href: "/playground" },
  { label: "Guide", href: "/guide" },
  { label: "Pricing", href: "/pricing" },
];
const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "#" },
];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-[#666666] text-xs uppercase tracking-[0.18em]">{title}</p>
      {links.map((l) => (
        <Link
          key={l.label}
          href={l.href}
          className="text-[#888888] text-sm transition-colors hover:text-[#E5E5E5]"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <Container className="flex flex-col justify-between gap-12 py-16 md:flex-row">
        <div className="max-w-xs">
          <Logo className="text-lg" />
          <p className="mt-3 text-[#888888] text-sm leading-relaxed">
            Natural language querying for any database.
          </p>
        </div>
        <div className="flex gap-16">
          <LinkColumn title="Product" links={PRODUCT} />
          <LinkColumn title="Legal" links={LEGAL} />
        </div>
      </Container>
      <div className="border-[#222222] border-t">
        <Container className="py-6">
          <p className="text-[#666666] text-sm">© {new Date().getFullYear()} Sqliqs. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
