import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TAGS } from "@/lib/cache";

const PUBLISHED = { status: "PUBLISHED" as const };

export const getSettings = unstable_cache(
  async () => {
    const existing = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { logo: true, defaultOgImage: true },
    });
    if (existing) return existing;
    return prisma.siteSettings.create({ data: { id: "singleton" }, include: { logo: true, defaultOgImage: true } });
  },
  ["site-settings"],
  { tags: [TAGS.settings], revalidate: 3600 },
);

export const getPage = unstable_cache(
  async (slug: string) =>
    prisma.page.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        seo: { include: { ogImage: true } },
        sections: {
          where: { isVisible: true, status: "PUBLISHED" },
          orderBy: { sortOrder: "asc" },
          include: { image: true, items: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
  ["page-by-slug"],
  { tags: [TAGS.pages, TAGS.seo], revalidate: 3600 },
);

export const getPrograms = unstable_cache(
  async () =>
    prisma.program.findMany({
      where: { ...PUBLISHED, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { image: true, features: { orderBy: { sortOrder: "asc" } } },
    }),
  ["programs-published"],
  { tags: [TAGS.programs], revalidate: 3600 },
);

export const getCredentials = unstable_cache(
  async () => prisma.credential.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
  ["credentials-published"],
  { tags: [TAGS.credentials], revalidate: 3600 },
);

export const getTimeline = unstable_cache(
  async () =>
    prisma.timelineEvent.findMany({
      where: PUBLISHED,
      orderBy: [{ sortOrder: "asc" }, { year: "asc" }],
      include: { image: true },
    }),
  ["timeline-published"],
  { tags: [TAGS.timeline], revalidate: 3600 },
);

export const getTestimonials = unstable_cache(
  async () =>
    prisma.testimonial.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" }, include: { image: true } }),
  ["testimonials-published"],
  { tags: [TAGS.testimonials], revalidate: 3600 },
);

export const getSuccessCases = unstable_cache(
  async () =>
    prisma.successCase.findMany({
      where: { ...PUBLISHED, consent: true },
      orderBy: { sortOrder: "asc" },
      include: { image: true },
    }),
  ["success-cases-published"],
  { tags: [TAGS.successCases], revalidate: 3600 },
);

export const getCountries = unstable_cache(
  async () => prisma.country.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
  ["countries-published"],
  { tags: [TAGS.countries], revalidate: 3600 },
);

export const getNavigation = unstable_cache(
  async () => prisma.navigationItem.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
  ["navigation-published"],
  { tags: [TAGS.navigation], revalidate: 3600 },
);

export const getSocialLinks = unstable_cache(
  async () => prisma.socialLink.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
  ["social-published"],
  { tags: [TAGS.social], revalidate: 3600 },
);

export const getPaymentMethods = unstable_cache(
  async () => prisma.paymentMethod.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
  ["payment-methods-published"],
  { tags: [TAGS.paymentMethods], revalidate: 3600 },
);

export const getSeoForPath = unstable_cache(
  async (path: string) => prisma.seoMetadata.findUnique({ where: { path }, include: { ogImage: true } }),
  ["seo-by-path"],
  { tags: [TAGS.seo], revalidate: 3600 },
);

export const getPublishedPagePaths = unstable_cache(
  async () => prisma.page.findMany({ where: PUBLISHED, select: { slug: true, updatedAt: true } }),
  ["page-paths"],
  { tags: [TAGS.pages], revalidate: 3600 },
);

export type SectionMap = Record<string, Awaited<ReturnType<typeof getPage>> extends infer P ? P extends { sections: infer S } ? S extends Array<infer I> ? I : never : never : never>;

/** Indexa las secciones de una página por su `key` para render declarativo. */
export function sectionsByKey<T extends { key: string }>(sections: T[]): Record<string, T> {
  return Object.fromEntries(sections.map((s) => [s.key, s])) as Record<string, T>;
}
