import { Container, Heading } from "./shared";
import { Reveal } from "./reveal";

const DATABASES = [
  {
    name: "PostgreSQL",
    icon: "/databases/postgresql.svg",
    desc: "Full schema introspection and relationship-aware queries.",
  },
  {
    name: "MySQL",
    icon: "/databases/mysql-wordmark-light.svg",
    desc: "Works with MySQL and MariaDB, read-only by default.",
  },
  {
    name: "SQLite",
    icon: "/databases/sqlite.svg",
    desc: "Local files or Turso — point it at a connection string.",
  },
  {
    name: "MongoDB",
    icon: "/databases/mongodb.svg",
    desc: "Collections and documents, queried in plain English.",
  },
];

export function DatabaseSupport() {
  return (
    <section className="border-[#222222] border-b bg-[#161616]">
      <Container className="py-24 text-center lg:py-28">
        <Reveal>
          <Heading className="mx-auto">Works with your stack.</Heading>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DATABASES.map((db, i) => (
            <Reveal key={db.name} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-[#262626] bg-[#0A0A0A] p-6 text-left transition-colors hover:border-[#333333]">
                <div className="flex h-8 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={db.icon} alt={`${db.name} logo`} className="h-8 w-auto" />
                </div>
                <h3 className="font-medium text-[#E5E5E5] text-lg">{db.name}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{db.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
