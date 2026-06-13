import { ServerOffIcon, EyeIcon, KeyRoundIcon, LockIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, SectionLabel, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

const PROPERTIES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ServerOffIcon,
    title: "Zero server storage",
    body: "Connection strings and keys live only in your browser.",
  },
  {
    icon: EyeIcon,
    title: "Read-only queries",
    body: "Every generated query is read-only — your data can't be changed.",
  },
  {
    icon: KeyRoundIcon,
    title: "BYOK",
    body: "Your own LLM key. Usage is billed by your provider, not us.",
  },
  {
    icon: LockIcon,
    title: "End-to-end TLS",
    body: "Everything travels over encrypted connections, end to end.",
  },
];

export function Privacy() {
  return (
    <section className="border-[#222222] border-b">
      <Container className="py-24 lg:py-28">
        <Reveal>
          <SectionLabel>Built different</SectionLabel>
          <Heading className="mt-4 max-w-2xl">Your data never leaves your device.</Heading>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {PROPERTIES.map((prop, i) => (
            <Reveal key={prop.title} delay={i * 0.06}>
              <div className="flex flex-col gap-3">
                <prop.icon className="size-5 stroke-[1.5] text-[#52E8A2]" />
                <h3 className="font-medium text-[#E5E5E5]">{prop.title}</h3>
                <Body className="text-sm">{prop.body}</Body>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
