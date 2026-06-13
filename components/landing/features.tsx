import Image from "next/image";
import { Container, Heading, Body } from "./shared";
import { Reveal } from "./reveal";

type Feature = {
  title: string;
  body: string;
  img: { src: string; w: number; h: number; alt: string };
  flip?: boolean; // mockup on the left when true
};

const FEATURES: Feature[] = [
  {
    title: "Chat with your data",
    body: "Ask follow-up questions, drill into results, and get a plain-English narrative alongside every query. Your full chat history is saved locally.",
    img: { src: "/feature-pictures/chat.png", w: 1536, h: 1024, alt: "Sqliqs chat answering a question with a result table" },
  },
  {
    title: "Visualize anything instantly",
    body: "Describe what you want to see. Sqliqs picks the right chart type and fills it with your data — switch chart types manually anytime.",
    img: { src: "/feature-pictures/chart.png", w: 1693, h: 929, alt: "A line chart rendered from a natural-language request" },
    flip: true,
  },
  {
    title: "Generate full reports",
    body: "Ask for a report in one sentence. Sqliqs queries your database, writes the narrative, and formats it as a polished document with charts. Export as PDF or Markdown.",
    img: { src: "/feature-pictures/report.png", w: 1402, h: 1122, alt: "A formatted report with headings, metrics, and a chart" },
  },
];

function FeatureRow({ title, body, img, flip }: Feature) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={flip ? "lg:order-2" : undefined}>
        <div className="max-w-md">
          <Heading className="text-[1.75rem] sm:text-3xl">{title}</Heading>
          <Body className="mt-5">{body}</Body>
        </div>
      </Reveal>
      <Reveal delay={0.1} className={flip ? "lg:order-1" : undefined}>
        <Image
          src={img.src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          className="h-auto w-full mix-blend-lighten"
        />
      </Reveal>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-[#222222] border-b">
      <Container className="flex flex-col gap-24 py-24 lg:gap-32 lg:py-32">
        {FEATURES.map((f) => (
          <FeatureRow key={f.title} {...f} />
        ))}
      </Container>
    </section>
  );
}
