import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SectionEditor, type SectionValues } from "@/components/admin/section-editor";

export const dynamic = "force-dynamic";

export default async function SitePageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { sortOrder: "asc" }, include: { items: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!page) notFound();

  const publicPath = slug === "home" ? "/" : `/${slug}`;

  return (
    <>
      <AdminPageHeader
        title={page.title}
        description="Editá los textos, imágenes y llamados a la acción de cada sección. El diseño se mantiene consistente."
      />

      <p className="mb-6 text-xs">
        <Link href={publicPath} className="inline-flex items-center gap-1 text-paper/45 hover:text-gold">
          Ver la página pública <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <Link href={`/admin/seo?path=${encodeURIComponent(publicPath)}`} className="ml-4 text-paper/45 hover:text-gold">
          Editar SEO de esta página
        </Link>
      </p>

      <div className="space-y-3">
        {page.sections.map((section, index) => (
          <SectionEditor key={section.id} section={section as unknown as SectionValues} defaultOpen={index === 0} />
        ))}
      </div>
    </>
  );
}
