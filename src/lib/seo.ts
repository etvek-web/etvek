import "server-only";
import type { Metadata } from "next";
import { getSeoForPath, getSettings } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

/** Metadata controlada desde /admin → SEO. */
export async function buildMetadata(path: string): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoForPath(path), getSettings()]);

  const title = seo?.metaTitle ?? settings.siteName;
  const description = seo?.metaDescription ?? settings.tagline ?? undefined;
  const ogImage = seo?.ogImage?.blobUrl ?? settings.defaultOgImage?.blobUrl;

  return {
    title,
    description,
    alternates: { canonical: seo?.canonical ?? absoluteUrl(path) },
    robots: seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: settings.siteName,
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: absoluteUrl(path),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
