import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/site/icon";
import { formatPrice } from "@/lib/utils";

export type ProgramCardData = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  summary: string | null;
  description: string | null;
  duration: string | null;
  sessions: string | null;
  icon: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  priceArs: number | null;
  priceUsd: number | null;
  showPrice: boolean;
  featured: boolean;
  image: { blobUrl: string; alt: string; width: number | null; height: number | null } | null;
  features: { id: string; label: string }[];
};

export function ProgramCard({ program, priority = false }: { program: ProgramCardData; priority?: boolean }) {
  const href = program.ctaHref ?? `/contacto?programa=${program.slug}`;
  return (
    <article className="group relative flex h-full flex-col border border-paper/10 bg-ink-800/60 transition-colors duration-300 hover:border-gold/40">
      {program.image && (
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={program.image.blobUrl}
            alt={program.image.alt || program.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <div className="mb-5 flex items-center gap-3 text-gold">
          <Icon name={program.icon} className="size-6" />
          {program.featured && (
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-gold/80">Destacado</span>
          )}
        </div>

        <h3 className="text-2xl leading-snug text-paper">{program.name}</h3>
        {program.subtitle && <p className="mt-2.5 text-sm leading-relaxed text-gold/75">{program.subtitle}</p>}
        {(program.summary || program.description) && (
          <p className="mt-4 text-sm leading-relaxed text-paper/60">{program.summary ?? program.description}</p>
        )}

        {program.features.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {program.features.map((f) => (
              <li key={f.id} className="flex gap-3 text-sm text-paper/55">
                <span aria-hidden="true" className="mt-2 block size-1 shrink-0 bg-clinic" />
                {f.label}
              </li>
            ))}
          </ul>
        )}

        {(program.duration || program.sessions) && (
          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-paper/40">
            {[program.duration, program.sessions].filter(Boolean).join(" · ")}
          </p>
        )}

        {program.showPrice && (program.priceArs || program.priceUsd) && (
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-paper/80">
            {program.priceArs != null && <span>{formatPrice(program.priceArs, "ARS")}</span>}
            {program.priceUsd != null && <span className="text-paper/50">{formatPrice(program.priceUsd, "USD")}</span>}
          </p>
        )}

        <div className="mt-auto pt-8">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-paper transition-colors hover:text-gold"
          >
            {program.ctaLabel ?? "Solicitar Admisión"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
