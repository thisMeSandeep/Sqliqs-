import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { ErCallout } from "@/components/landing/er-callout";
import { Privacy } from "@/components/landing/privacy";
import { DatabaseSupport } from "@/components/landing/database-support";
import { Providers } from "@/components/landing/providers";
import { Pricing } from "@/components/landing/pricing";
import { PlaygroundCta } from "@/components/landing/playground-cta";
import { Footer } from "@/components/landing/footer";

// Dark-only marketing landing. The palette is inlined per-section (not theme
// tokens), so it renders identically regardless of the app's light/dark class.
// Each section is its own component; this file is just the running order.
export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-[#E5E5E5] antialiased">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Features />
        <ErCallout />
        <Privacy />
        <DatabaseSupport />
        <Providers />
        <Pricing />
        <PlaygroundCta />
      </main>
      <Footer />
    </div>
  );
}
