import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { Container, Display, Body, primaryCta, ghostCta } from "./shared";
import { Reveal } from "./reveal";

// Left-aligned hero with the product screenshot as a large right-anchored
// backdrop that bleeds off the edge. mix-blend-lighten drops the image's dark
// backdrop into the page, so it can sit behind the copy without a visible box.
// On mobile the image stacks below the text in normal flow instead.
export function Hero() {
  return (
    <section className="relative overflow-hidden border-[#222222] border-b">
      {/* Desktop: image as a right-side backdrop, bleeding past the edge. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] items-center lg:flex">
        <Reveal delay={0.1} className="w-full">
          <Image
            src="/feature-pictures/chat.png"
            alt="Sqliqs answering a natural-language question with a result table"
            width={1536}
            height={1024}
            priority
            className="h-auto w-full mix-blend-lighten"
          />
        </Reveal>
      </div>

      <Container className="relative z-10 flex flex-col gap-14 py-20 lg:py-32">
        <Reveal>
          <div className="max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#52E8A2]/30 bg-[#52E8A2]/10 px-3 py-1 font-medium text-[#52E8A2] text-xs">
              <span className="size-1.5 rounded-full bg-[#52E8A2]" />
              100% free — you only pay your own model provider
            </span>
            <Display>
              Ask your database.
              <br />
              Get answers.
            </Display>
            <Body className="mt-6 text-lg text-[#C2C2C2]">
              Connect any database and query it in plain English. <br/>
              No SQL, no setup. Bring your own key.
            </Body>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/playground" className={primaryCta}>
                Try the Playground
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link href="/sign-up" className={ghostCta}>
                Connect your database
              </Link>
            </div>
            <p className="mt-7 text-[#888888] text-sm">Free forever · No data stored · BYOK</p>
          </div>
        </Reveal>

        {/* Mobile/tablet: image stacks in flow (the backdrop is hidden below lg). */}
        <Reveal delay={0.1} className="lg:hidden">
          <Image
            src="/feature-pictures/chat.png"
            alt="Sqliqs answering a natural-language question with a result table"
            width={1536}
            height={1024}
            className="h-auto w-full mix-blend-lighten"
          />
        </Reveal>
      </Container>
    </section>
  );
}
