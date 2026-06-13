import { PROVIDER_META, providerIcon } from "@/lib/ai/models";
import type { ProviderId } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { Container, SectionLabel, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

// Mirrors the app's BYOK picker. Order is curated; labels and the dark-invert
// treatment come from PROVIDER_META so this never drifts from what the product
// supports. The "Free" badge is landing-specific: it marks only the provider we
// actually offer a built-in free model through (OpenRouter) — NOT every provider
// that happens to give out free API keys (PROVIDER_META.freeTier means that).
const ORDER: ProviderId[] = ["openrouter", "anthropic", "openai", "google", "xai", "deepseek"];
const FREE_ON_LANDING = new Set<ProviderId>(["openrouter"]);

export function Providers() {
  return (
    <section className="border-[#222222] border-b">
      <Container className="py-24 text-center lg:py-28">
        <Reveal>
          <SectionLabel>Bring your own model</SectionLabel>
          <Heading className="mx-auto mt-4 max-w-2xl">Use any major AI provider.</Heading>
          <Body className="mx-auto mt-5 max-w-xl">
            Plug in your own key from any supported provider — your usage is billed by them, not us.
            Or start instantly with a built-in free model.
          </Body>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ORDER.map((id, i) => {
            const meta = PROVIDER_META[id];
            return (
              <Reveal key={id} delay={i * 0.05}>
                <div className="relative flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-[#262626] bg-[#161616] p-6 transition-colors hover:border-[#333333]">
                  {FREE_ON_LANDING.has(id) && (
                    <span className="absolute top-2.5 right-2.5 rounded-full border border-[#52E8A2]/30 px-2 py-0.5 font-medium text-[#52E8A2] text-[0.65rem]">
                      Free
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={providerIcon(id)}
                    alt={`${meta.label} logo`}
                    className={cn("h-8 w-8 object-contain", meta.darkInvert && "invert")}
                  />
                  <span className="font-medium text-[#E5E5E5] text-sm">{meta.label}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
