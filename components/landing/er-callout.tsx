import Image from "next/image";
import { Container, SectionLabel, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

// Elevated #161616 band — the one surface-color break on the page. Schema story
// on the left, the auto-generated diagram on the right.
export function ErCallout() {
  return (
    <section className="border-[#222222] border-b bg-[#161616]">
      <Container className="grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <Reveal>
          <div className="max-w-md">
            <SectionLabel>Schema, visualized</SectionLabel>
            <Heading className="mt-4">Explore your schema visually.</Heading>
            <Body className="mt-5">
              Every connected database gets an auto-generated ER diagram. See all your tables,
              columns, and relationships at a glance — then export it as SVG or PNG.
            </Body>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
            <Image
              src="/feature-pictures/er.png"
              alt="Auto-generated ER diagram with table nodes and relationship lines"
              width={1536}
              height={1024}
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
