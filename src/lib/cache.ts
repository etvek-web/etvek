import { revalidateTag } from "next/cache";

export const TAGS = {
  settings: "settings",
  pages: "pages",
  programs: "programs",
  credentials: "credentials",
  timeline: "timeline",
  testimonials: "testimonials",
  successCases: "success-cases",
  countries: "countries",
  navigation: "navigation",
  social: "social",
  seo: "seo",
  paymentMethods: "payment-methods",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/** Invalida el contenido público cuando se publica un cambio desde /admin. */
export function revalidateContent(...tags: CacheTag[]) {
  for (const tag of tags.length ? tags : (Object.values(TAGS) as CacheTag[])) {
    revalidateTag(tag);
  }
}
