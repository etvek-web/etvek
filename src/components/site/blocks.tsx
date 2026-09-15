import Image from "next/image";
import { Icon } from "@/components/site/icon";
import { Reveal } from "@/components/site/reveal";

type Item = { id: string; title: string; body: string | null; icon: string | null };

export function CredentialStrip({
  credentials,
}: {
  credentials: { id: string; label: string; detail: string | null; icon: string | null }[];
}) {
  if (credentials.length === 0) return null;
  return (
    <ul className="grid gap-px border border-paper/10 bg-paper/10 sm:grid-cols-2 lg:grid-cols-3">
      {credentials.map((c) => (
        <li key={c.id} className="flex gap-4 bg-ink px-6 py-7">
          <span className="mt-0.5 shrink-0 text-gold">
            <Icon name={c.icon} className="size-5" />
          </span>
          <div>
            <p className="text-sm leading-snug text-paper/85">{c.label}</p>
            {c.detail && <p className="mt-1.5 text-xs leading-relaxed text-paper/45">{c.detail}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Pillars({ items, numbered = false }: { items: Item[]; numbered?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ol className="grid gap-px border border-paper/10 bg-paper/10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.id} className="bg-ink p-8 lg:p-10">
          <Reveal delay={i * 0.06}>
            <span className="text-gold">
              {numbered ? (
                <span className="font-display text-3xl text-gold/70">{String(i + 1).padStart(2, "0")}</span>
              ) : (
                <Icon name={item.icon} className="size-6" />
              )}
            </span>
            <h3 className="mt-5 text-xl leading-snug text-paper">{item.title}</h3>
            {item.body && <p className="mt-3 text-sm leading-relaxed text-paper/60">{item.body}</p>}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function CountryCoverage({
  countries,
}: {
  countries: { id: string; name: string; flag: string | null; timezone: string | null }[];
}) {
  if (countries.length === 0) return null;
  return (
    <ul className="grid gap-px border border-paper/10 bg-paper/10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {countries.map((c) => (
        <li key={c.id} className="flex flex-col items-center gap-3 bg-ink px-4 py-8 text-center">
          <span aria-hidden="true" className="text-2xl">
            {c.flag ?? "🌐"}
          </span>
          <p className="text-sm text-paper/80">{c.name}</p>
        </li>
      ))}
    </ul>
  );
}

export function RichText({ body }: { body: string }) {
  return (
    <div className="prose-etvek max-w-3xl">
      {body.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function BioBlock({
  body,
  image,
}: {
  body: string;
  image?: { blobUrl: string; alt: string; width: number | null; height: number | null } | null;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {image && (
        <div className="lg:col-span-5">
          <div className="relative aspect-4/5 w-full overflow-hidden border border-paper/10">
            <Image
              src={image.blobUrl}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
      <div className={image ? "lg:col-span-7" : "lg:col-span-12"}>
        <RichText body={body} />
      </div>
    </div>
  );
}

export function Timeline({
  events,
}: {
  events: {
    id: string;
    year: string | null;
    title: string;
    institution: string | null;
    description: string | null;
    country: string | null;
    city: string | null;
    link: string | null;
    category: string | null;
    featured: boolean;
  }[];
}) {
  if (events.length === 0) return null;
  return (
    <ol className="relative border-l border-paper/12 pl-6 sm:pl-10">
      {events.map((e, i) => (
        <li key={e.id} className="relative pb-12 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute -left-[1.6rem] top-2 block size-2 rounded-full sm:-left-[2.6rem] ${
              e.featured ? "bg-gold" : "bg-clinic"
            }`}
          />
          <Reveal delay={Math.min(i * 0.04, 0.2)}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {e.year && <span className="font-display text-2xl text-gold/80">{e.year}</span>}
              {e.category && (
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-paper/40">{e.category}</span>
              )}
            </div>
            <h3 className="mt-2 text-xl leading-snug text-paper">{e.title}</h3>
            {e.institution && <p className="mt-1.5 text-sm text-paper/60">{e.institution}</p>}
            {e.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper/55">{e.description}</p>}
            {(e.city || e.country) && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-paper/35">
                {[e.city, e.country].filter(Boolean).join(", ")}
              </p>
            )}
            {e.link && (
              <a
                href={e.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-gold underline-offset-4 hover:underline"
              >
                Ver más
              </a>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function SuccessCases({
  cases,
}: {
  cases: {
    id: string;
    person: string;
    project: string | null;
    objective: string;
    process: string | null;
    result: string | null;
    country: string | null;
    image: { blobUrl: string; alt: string } | null;
  }[];
}) {
  if (cases.length === 0) return null;
  return (
    <div className="grid gap-px border border-paper/10 bg-paper/10 md:grid-cols-2">
      {cases.map((c) => (
        <article key={c.id} className="bg-ink p-8">
          <h3 className="text-xl text-paper">{c.person}</h3>
          {(c.project || c.country) && (
            <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-paper/40">
              {[c.project, c.country].filter(Boolean).join(" · ")}
            </p>
          )}
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-gold/80">Objetivo</dt>
              <dd className="mt-1 leading-relaxed text-paper/70">{c.objective}</dd>
            </div>
            {c.process && (
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-gold/80">Proceso</dt>
                <dd className="mt-1 leading-relaxed text-paper/70">{c.process}</dd>
              </div>
            )}
            {c.result && (
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-gold/80">Resultado</dt>
                <dd className="mt-1 leading-relaxed text-paper/70">{c.result}</dd>
              </div>
            )}
          </dl>
        </article>
      ))}
    </div>
  );
}
