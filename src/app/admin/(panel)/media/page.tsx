import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media-library";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;

  const [items, agg] = await Promise.all([
    prisma.media.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { fileName: { contains: q, mode: "insensitive" as const } },
                { alt: { contains: q, mode: "insensitive" as const } },
                { folder: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.media.aggregate({ _sum: { size: true, originalSize: true }, _count: true, where: { deletedAt: null } }),
  ]);

  const stored = agg._sum.size ?? 0;
  const original = agg._sum.originalSize ?? 0;

  return (
    <>
      <AdminPageHeader
        title="Biblioteca de medios"
        description="Todas las imágenes se optimizan en el navegador antes de subirse a Vercel Blob."
      />

      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-paper/10 bg-ink-800/60 p-5">
          <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-paper/40">Almacenamiento usado</dt>
          <dd className="mt-2 font-display text-2xl text-paper">{formatBytes(stored)}</dd>
        </div>
        <div className="border border-paper/10 bg-ink-800/60 p-5">
          <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-paper/40">Archivos</dt>
          <dd className="mt-2 font-display text-2xl text-paper">{agg._count}</dd>
        </div>
        <div className="border border-paper/10 bg-ink-800/60 p-5">
          <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-paper/40">Ahorro por compresión</dt>
          <dd className="mt-2 font-display text-2xl text-paper">
            {original > stored ? `${formatBytes(original)} → ${formatBytes(stored)}` : "—"}
          </dd>
        </div>
      </dl>

      <MediaLibrary
        initialQuery={q}
        items={items.map((m) => ({
          id: m.id,
          blobUrl: m.blobUrl,
          fileName: m.fileName,
          alt: m.alt,
          description: m.description,
          folder: m.folder,
          mimeType: m.mimeType,
          width: m.width,
          height: m.height,
          size: m.size,
          originalSize: m.originalSize,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
