import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Hero } from "@/components/site/hero";
import { BioBlock, CountryCoverage, CredentialStrip, Pillars, RichText, SuccessCases, Timeline } from "@/components/site/blocks";
import { ProgramCard, type ProgramCardData } from "@/components/site/program-card";
import { TestimonialSlider, type TestimonialData } from "@/components/site/testimonials";
import { PaymentInfo, type PaymentMethodData } from "@/components/site/payment-info";
import { Scheduler } from "@/components/site/scheduler";
import { AdmissionForm } from "@/components/site/admission-form";
import { AcousticWave } from "@/components/site/acoustic-wave";

type MediaRef = { blobUrl: string; alt: string; width: number | null; height: number | null } | null;

export type Section = {
  id: string;
  key: string;
  kind: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaLabel2: string | null;
  ctaHref2: string | null;
  data: unknown;
  image: MediaRef;
  items: { id: string; title: string; body: string | null; icon: string | null }[];
};

export type RenderContext = {
  isFirstSection: boolean;
  programs: ProgramCardData[];
  credentials: { id: string; label: string; detail: string | null; icon: string | null }[];
  countries: { id: string; name: string; flag: string | null; timezone: string | null; dialCode: string }[];
  testimonials: TestimonialData[];
  successCases: Parameters<typeof SuccessCases>[0]["cases"];
  timeline: Parameters<typeof Timeline>[0]["events"];
  paymentMethods: PaymentMethodData[];
  scheduler: { url: string | null; provider: string; enabled: boolean };
  heroModel: { enabled: boolean; url: string | null; credit: string | null; creditUrl: string | null };
  whatsappHref: string | null;
};

function Band({
  children,
  tight = false,
  surface = false,
}: {
  children: React.ReactNode;
  tight?: boolean;
  surface?: boolean;
}) {
  return (
    <section className={surface ? "bg-ink-800/40" : undefined}>
      <div className={`container-etvek ${tight ? "py-14 sm:py-16" : "py-20 sm:py-28"}`}>{children}</div>
    </section>
  );
}

export function SectionRenderer({ section, ctx }: { section: Section; ctx: RenderContext }) {
  const heading = (
    <SectionHeading
      eyebrow={section.eyebrow}
      title={section.title}
      subtitle={section.subtitle}
      as={ctx.isFirstSection ? "h1" : "h2"}
    />
  );

  switch (section.kind) {
    case "HERO":
      return (
        <Hero
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          image={section.image}
          ctaLabel={section.ctaLabel}
          ctaHref={section.ctaHref}
          ctaLabel2={section.ctaLabel2}
          ctaHref2={section.ctaHref2}
          compact={!ctx.isFirstSection}
          model={ctx.heroModel}
        />
      );

    case "CREDENTIAL_STRIP":
      if (ctx.credentials.length === 0) return null;
      return (
        <Band tight surface>
          {heading}
          <div className="mt-10">
            <CredentialStrip credentials={ctx.credentials} />
          </div>
        </Band>
      );

    case "MANIFESTO": {
      const quote = (section.data as { quote?: string } | null)?.quote;
      return (
        <Band>
          {heading}
          {section.body && (
            <div className="mt-10">
              <RichText body={section.body} />
            </div>
          )}
          {section.items.length > 0 && (
            <div className="mt-12">
              <Pillars items={section.items} numbered />
            </div>
          )}
          {quote && (
            <figure className="mt-16 border-l-2 border-gold pl-6 sm:pl-10">
              <blockquote className="max-w-3xl font-display text-2xl leading-snug text-paper/90 sm:text-3xl">
                “{quote}”
              </blockquote>
            </figure>
          )}
        </Band>
      );
    }

    case "PILLARS":
      return (
        <Band>
          {heading}
          <div className="mt-12">
            <Pillars items={section.items} />
          </div>
        </Band>
      );

    case "PROGRAM_GRID":
      if (ctx.programs.length === 0) return null;
      return (
        <Band surface>
          {heading}
          <div className="mt-12 grid gap-px border border-paper/10 bg-paper/10 md:grid-cols-2">
            {ctx.programs.map((p, i) => (
              <ProgramCard key={p.id} program={p} priority={i === 0 && ctx.isFirstSection} />
            ))}
          </div>
          {section.ctaHref && (
            <div className="mt-10">
              <ButtonLink href={section.ctaHref} variant="outline">
                {section.ctaLabel ?? "Ver más"}
              </ButtonLink>
            </div>
          )}
        </Band>
      );

    case "COUNTRY_COVERAGE":
      if (ctx.countries.length === 0) return null;
      return (
        <Band>
          {heading}
          <div className="mt-12">
            <CountryCoverage countries={ctx.countries} />
          </div>
        </Band>
      );

    case "TESTIMONIALS":
      // Nunca se inventan testimonios: si no hay publicados, la sección no se muestra.
      if (ctx.testimonials.length === 0 && ctx.successCases.length === 0) return null;
      return (
        <Band surface>
          {heading}
          {ctx.testimonials.length > 0 && (
            <div className="mt-12">
              <TestimonialSlider items={ctx.testimonials} />
            </div>
          )}
          {ctx.successCases.length > 0 && (
            <div className="mt-12">
              <SuccessCases cases={ctx.successCases} />
            </div>
          )}
        </Band>
      );

    case "SUCCESS_CASES":
      if (ctx.successCases.length === 0) return null;
      return (
        <Band>
          {heading}
          <div className="mt-12">
            <SuccessCases cases={ctx.successCases} />
          </div>
        </Band>
      );

    case "TIMELINE":
      if (ctx.timeline.length === 0) return null;
      return (
        <Band>
          {heading}
          <div className="mt-14">
            <Timeline events={ctx.timeline} />
          </div>
        </Band>
      );

    case "BIO":
      return (
        <Band>
          {heading}
          {section.body && (
            <div className="mt-12">
              <BioBlock body={section.body} image={section.image} />
            </div>
          )}
        </Band>
      );

    case "RICH_TEXT":
      return (
        <Band>
          {heading}
          {section.body && (
            <div className="mt-10">
              <RichText body={section.body} />
            </div>
          )}
        </Band>
      );

    case "PAYMENT_INFO":
      if (ctx.paymentMethods.length === 0) return null;
      return (
        <Band surface>
          {heading}
          <div className="mt-10">
            <PaymentInfo methods={ctx.paymentMethods} whatsappHref={ctx.whatsappHref} />
          </div>
        </Band>
      );

    case "SCHEDULER":
      if (!ctx.scheduler.enabled || !ctx.scheduler.url) return null;
      return (
        <Band>
          {heading}
          <div className="mt-10">
            <Scheduler url={ctx.scheduler.url} provider={ctx.scheduler.provider} />
          </div>
        </Band>
      );

    case "CONTACT_FORM":
      return (
        <Band>
          {heading}
          <div className="mt-10 max-w-3xl">
            <Suspense fallback={<p className="text-sm text-paper/50">Cargando formulario…</p>}>
              <AdmissionForm
                countries={ctx.countries.map((c) => ({ id: c.id, name: c.name, dialCode: c.dialCode, flag: c.flag }))}
                programs={ctx.programs.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))}
              />
            </Suspense>
          </div>
        </Band>
      );

    case "CTA":
      return (
        <section className="relative isolate overflow-hidden border-y border-paper/10 bg-ink-800/60">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-25">
            <AcousticWave />
          </div>
          <div className="container-etvek py-20 text-center sm:py-24">
            <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} align="center" />
            {section.ctaHref && (
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <ButtonLink href={section.ctaHref} size="lg">
                  {section.ctaLabel ?? "Solicitar Evaluación Vocal"}
                </ButtonLink>
                {section.ctaHref2 && (
                  <ButtonLink href={section.ctaHref2} variant="outline" size="lg">
                    {section.ctaLabel2 ?? "Ver más"}
                  </ButtonLink>
                )}
              </div>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}
