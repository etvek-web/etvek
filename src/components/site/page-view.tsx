import { notFound } from "next/navigation";
import {
  getCountries,
  getCredentials,
  getPage,
  getPaymentMethods,
  getPrograms,
  getSettings,
  getSuccessCases,
  getTestimonials,
  getTimeline,
} from "@/lib/content";
import { SectionRenderer, type RenderContext, type Section } from "@/components/site/section-renderer";
import { whatsappHref } from "@/lib/utils";

/** Render declarativo de una página del CMS: las secciones y su orden vienen de la base. */
export async function PageView({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();

  const [settings, programs, credentials, countries, testimonials, successCases, timeline, paymentMethods] =
    await Promise.all([
      getSettings(),
      getPrograms(),
      getCredentials(),
      getCountries(),
      getTestimonials(),
      getSuccessCases(),
      getTimeline(),
      getPaymentMethods(),
    ]);

  const ctxBase: Omit<RenderContext, "isFirstSection"> = {
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      subtitle: p.subtitle,
      summary: p.summary,
      description: p.description,
      duration: p.duration,
      sessions: p.sessions,
      icon: p.icon,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
      priceArs: p.priceArs,
      priceUsd: p.priceUsd,
      showPrice: p.showPrice,
      featured: p.featured,
      image: p.image ? { blobUrl: p.image.blobUrl, alt: p.image.alt, width: p.image.width, height: p.image.height } : null,
      features: p.features.map((f) => ({ id: f.id, label: f.label })),
    })),
    credentials: credentials.map((c) => ({ id: c.id, label: c.label, detail: c.detail, icon: c.icon })),
    countries: countries.map((c) => ({
      id: c.id,
      name: c.name,
      flag: c.flag,
      timezone: c.timezone,
      dialCode: c.dialCode,
    })),
    testimonials: testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      project: t.project,
      country: t.country,
      quote: t.quote,
      instagram: t.instagram,
      videoUrl: t.videoUrl,
      image: t.image ? { blobUrl: t.image.blobUrl, alt: t.image.alt } : null,
    })),
    successCases: successCases.map((c) => ({
      id: c.id,
      person: c.person,
      project: c.project,
      objective: c.objective,
      process: c.process,
      result: c.result,
      country: c.country,
      image: c.image ? { blobUrl: c.image.blobUrl, alt: c.image.alt } : null,
    })),
    timeline: timeline.map((e) => ({
      id: e.id,
      year: e.year,
      title: e.title,
      institution: e.institution,
      description: e.description,
      country: e.country,
      city: e.city,
      link: e.link,
      category: e.category,
      featured: e.featured,
    })),
    paymentMethods: paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      currency: m.currency,
      instructions: m.instructions,
      holder: m.holder,
      bank: m.bank,
      cbu: m.cbu,
      alias: m.alias,
      accountInfo: m.accountInfo,
    })),
    scheduler: {
      url: settings.schedulerUrl,
      provider: settings.schedulerProvider,
      enabled: settings.schedulerEnabled && Boolean(settings.schedulerUrl),
    },
    whatsappHref: settings.whatsappEnabled
      ? whatsappHref(settings.whatsappNumber, settings.whatsappMessage)
      : null,
  };

  return (
    <>
      {page.sections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section as unknown as Section}
          ctx={{ ...ctxBase, isFirstSection: index === 0 }}
        />
      ))}
    </>
  );
}
