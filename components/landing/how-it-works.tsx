import { Container, SectionLabel, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Connect your database",
    body: "Paste a connection string for Postgres, MySQL, SQLite, or MongoDB. It stays in your browser — never on our servers.",
  },
  {
    n: "02",
    title: "Pick a model, bring your key",
    body: "Choose any supported model and use your own API key — or start instantly with the built-in free model.",
  },
  {
    n: "03",
    title: "Ask in plain English",
    body: "Type a question the way you'd say it. Sqliqs reads your schema and writes the read-only query for you.",
  },
  {
    n: "04",
    title: "Get answers, charts & reports",
    body: "See a clear answer, a result table, an instant chart, or a full written report — whatever the question calls for.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-[#222222] border-b">
      <Container className="py-24 lg:py-28">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <Heading className="mt-4 max-w-xl">Four steps to your answer.</Heading>
        </Reveal>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="flex flex-col gap-4">
                <span className="font-medium text-5xl text-white/[0.08] tabular-nums">
                  {step.n}
                </span>
                <h3 className="font-medium text-[#E5E5E5] text-lg">{step.title}</h3>
                <Body className="text-[15px]">{step.body}</Body>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
