import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Container, Heading, Body, primaryCta } from "./shared";
import { Reveal } from "./reveal";

const INCLUDED = [
  "Unlimited databases and chats",
  "Charts, reports, and ER diagrams",
  "Bring your own LLM key — or use the built-in free model",
  "Everything stays on your device",
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-[#222222] border-b">
      <Container className="py-24 text-center lg:py-28">
        <Reveal>
          <Heading className="mx-auto max-w-2xl">Free. No paywalls. Ever.</Heading>
          <Body className="mx-auto mt-5 max-w-xl">
            Bring your own LLM key — your usage costs go to your provider, not us. Or use the
            built-in free model and get started in seconds.
          </Body>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-14 max-w-md rounded-2xl border border-[#262626] bg-[#161616] p-8 text-left">
            <p className="font-medium text-[#52E8A2] text-sm uppercase tracking-[0.18em]">
              Free Forever
            </p>
            <p className="mt-3 font-medium text-5xl text-white tracking-tight">$0</p>
            <ul className="mt-8 flex flex-col gap-3.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#E5E5E5] text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#52E8A2]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className={`${primaryCta} mt-8 w-full`}>
              Get Started
            </Link>
          </div>
          <p className="mt-6 text-[#888888] text-sm">
            <Link href="/pricing" className="text-[#52E8A2] transition-colors hover:text-[#6BEEB2]">
              See how pricing works →
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
