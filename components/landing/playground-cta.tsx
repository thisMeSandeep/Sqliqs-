import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

// The conversion moment: a very low-opacity mint wash over the base, a big
// centered ask, one button. Not a footer afterthought.
export function PlaygroundCta() {
  return (
    <section className="border-[#222222] border-b bg-[#52E8A2]/[0.04]">
      <Container className="py-28 text-center lg:py-32">
        <Reveal>
          <Heading className="mx-auto max-w-2xl text-4xl sm:text-5xl">
            Try it before you sign up.
          </Heading>
          <Body className="mx-auto mt-5 max-w-lg text-lg">
            The Playground is open to everyone — no login, no database, no key. Just ask.
          </Body>
          <Link
            href="/playground"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-[#52E8A2] px-7 py-3 font-medium text-[#0A0A0A] text-base transition-colors hover:bg-[#6BEEB2]"
          >
            Open the Playground
            <ArrowRightIcon className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
