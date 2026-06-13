import { Container } from "./shared";

// Thin "works with" strip. Logos keep their brand colors, dropped slightly in
// opacity at rest and brightening to full on hover.
const DATABASES = [
  { src: "/databases/postgresql.svg", alt: "PostgreSQL" },
  { src: "/databases/mysql-wordmark-light.svg", alt: "MySQL" },
  { src: "/databases/sqlite.svg", alt: "SQLite" },
  { src: "/databases/mongodb.svg", alt: "MongoDB" },
];

export function TrustBar() {
  return (
    <section className="border-[#222222] border-b">
      <Container className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:gap-12">
        <span className="shrink-0 font-medium text-[#666666] text-xs uppercase tracking-[0.18em]">
          Works with
        </span>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-12 gap-y-6 sm:justify-start">
          {DATABASES.map((db) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={db.alt}
              src={db.src}
              alt={db.alt}
              className="h-6 w-auto opacity-80 transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
