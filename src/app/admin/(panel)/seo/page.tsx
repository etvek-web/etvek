import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SeoForm } from "@/components/admin/seo-form";

export const dynamic = "force-dynamic";

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const { path } = await searchParams;

  const pages = await prisma.page.findMany({ where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } });
  const paths = pages.map((p) => ({ path: p.slug === "home" ? "/" : `/${p.slug}`, title: p.title }));
  const current = paths.find((p) => p.path === path) ?? paths[0];

  const seo = current ? await prisma.seoMetadata.findUnique({ where: { path: current.path } }) : null;

  return (
    <>
      <AdminPageHeader title="SEO" description="Metadatos, Open Graph e indexación de cada página." />

      <div className="mb-8 flex flex-wrap gap-2 text-xs">
        {paths.map((p) => (
          <Link
            key={p.path}
            href={`/admin/seo?path=${encodeURIComponent(p.path)}`}
            className={`border px-3 py-1.5 ${
              current?.path === p.path ? "border-gold text-gold" : "border-paper/15 text-paper/55 hover:text-paper"
            }`}
          >
            {p.title}
          </Link>
        ))}
      </div>

      {current && (
        <SeoForm
          path={current.path}
          values={{
            metaTitle: seo?.metaTitle ?? "",
            metaDescription: seo?.metaDescription ?? "",
            ogTitle: seo?.ogTitle ?? "",
            ogDescription: seo?.ogDescription ?? "",
            ogImageId: seo?.ogImageId ?? null,
            canonical: seo?.canonical ?? "",
            noindex: seo?.noindex ?? false,
          }}
        />
      )}
    </>
  );
}
