import type { MetadataRoute } from "next";
import { getPublishedPagePaths } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedPagePaths();
  return pages.map((p) => {
    const path = p.slug === "home" ? "/" : `/${p.slug}`;
    return {
      url: absoluteUrl(path),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    };
  });
}
