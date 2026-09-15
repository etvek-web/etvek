import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { AcousticWave } from "@/components/site/acoustic-wave";

export function Hero({
  eyebrow,
  title,
  subtitle,
  image,
  ctaLabel,
  ctaHref,
  ctaLabel2,
  ctaHref2,
  compact = false,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  image?: { blobUrl: string; alt: string } | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  ctaLabel2?: string | null;
  ctaHref2?: string | null;
  compact?: boolean;
}) {
  return (
    <section className={`relative isolate overflow-hidden ${compact ? "min-h-[62svh]" : "min-h-[88svh]"} flex items-end`}>
      {image ? (
        <>
          <Image
            src={image.blobUrl}
            alt={image.alt || title || "ETVEK"}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/80 to-ink/35"
          />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-ink-700 via-ink to-ink" />
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 opacity-40">
        <AcousticWave />
      </div>

      <div className="container-etvek w-full pb-20 pt-36 sm:pb-24 sm:pt-44">
        {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
        {title && (
          <h1 className="max-w-4xl text-balance font-display text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-[4rem]">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-paper/65 sm:text-lg">{subtitle}</p>
        )}

        {(ctaHref || ctaHref2) && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {ctaHref && (
              <ButtonLink href={ctaHref} size="lg">
                {ctaLabel ?? "Solicitar Evaluación Vocal"}
              </ButtonLink>
            )}
            {ctaHref2 && (
              <ButtonLink href={ctaHref2} variant="outline" size="lg">
                {ctaLabel2 ?? "Ver más"}
              </ButtonLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
