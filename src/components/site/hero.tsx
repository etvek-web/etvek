import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { AcousticWave } from "@/components/site/acoustic-wave";
import { LarynxViewer } from "@/components/site/larynx";

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
  model,
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
  /** Pieza 3D opcional junto al titular. Sólo en el hero principal. */
  model?: { enabled: boolean; url: string | null; credit: string | null; creditUrl: string | null };
}) {
  const showModel = Boolean(model?.enabled) && !compact;

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
        <div className={showModel ? "grid items-center gap-10 lg:grid-cols-12" : undefined}>
          <div className={showModel ? "lg:col-span-7" : undefined}>
            {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
            {title && (
              <h1 className="max-w-4xl text-balance font-display text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-[4rem]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-paper/65 sm:text-lg">
                {subtitle}
              </p>
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

          {showModel && (
            <div className="hidden lg:col-span-5 lg:block">
              {/* El visor se monta sólo en pantallas grandes y con WebGL disponible;
                  mientras no esté listo, el espacio queda vacío sin mover el texto. */}
              <div className="relative aspect-square w-full">
                <LarynxViewer modelUrl={model?.url} />
              </div>

              {/* Crédito del modelo: sólo aparece si está cargado en el panel. */}
              {model?.credit && (
                <p className="mt-3 text-center text-[0.65rem] tracking-wide text-paper/25">
                  {model.creditUrl ? (
                    <a
                      href={model.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="hover:text-paper/50"
                    >
                      {model.credit}
                    </a>
                  ) : (
                    model.credit
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
