"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { deleteBlob } from "@/lib/blob";
import { mediaUpdateSchema } from "@/lib/validation";
import { revalidateContent } from "@/lib/cache";

type RegisterInput = {
  blobUrl: string;
  blobPathname: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  originalSize: number | null;
  hash: string | null;
  alt: string;
  folder: string | null;
};

/** Registra en Postgres la metadata del archivo ya subido a Blob. Evita duplicados por hash. */
export async function registerMedia(input: RegisterInput) {
  const user = await requireUser();

  if (input.hash) {
    const duplicate = await prisma.media.findFirst({
      where: { hash: input.hash, deletedAt: null, size: input.size },
    });
    if (duplicate) {
      // Ya existe exactamente el mismo archivo: descartamos el blob recién subido.
      await deleteBlob(input.blobUrl).catch(() => undefined);
      await audit(user, "MEDIA_DEDUPED", "Media", duplicate.id);
      return { id: duplicate.id, duplicated: true as const };
    }
  }

  const media = await prisma.media.create({
    data: {
      blobUrl: input.blobUrl,
      blobPathname: input.blobPathname,
      fileName: input.fileName,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      size: input.size,
      originalSize: input.originalSize,
      hash: input.hash,
      alt: input.alt,
      folder: input.folder,
    },
  });

  await audit(user, "CREATE", "Media", media.id, { fileName: media.fileName, size: media.size });
  revalidatePath("/admin/media");
  return { id: media.id, duplicated: false as const };
}

export async function updateMedia(id: string, formData: FormData) {
  const user = await requireUser();
  const parsed = mediaUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  await prisma.media.update({ where: { id }, data: parsed.data });
  await audit(user, "UPDATE", "Media", id);
  revalidatePath("/admin/media");
  revalidateContent();
  return { ok: true as const };
}

/** Devuelve dónde se usa un archivo. Nunca se borra un archivo todavía referenciado. */
export async function mediaUsage(id: string) {
  await requireUser();
  const [sections, programs, timeline, testimonials, cases, seo, settings] = await Promise.all([
    prisma.pageSection.findMany({ where: { imageId: id }, select: { id: true, key: true, page: { select: { title: true } } } }),
    prisma.program.findMany({ where: { imageId: id }, select: { id: true, name: true } }),
    prisma.timelineEvent.findMany({ where: { imageId: id }, select: { id: true, title: true } }),
    prisma.testimonial.findMany({ where: { imageId: id }, select: { id: true, name: true } }),
    prisma.successCase.findMany({ where: { imageId: id }, select: { id: true, person: true } }),
    prisma.seoMetadata.findMany({ where: { ogImageId: id }, select: { id: true, path: true } }),
    prisma.siteSettings.findMany({
      where: { OR: [{ logoId: id }, { defaultOgImageId: id }] },
      select: { id: true },
    }),
  ]);

  const usage: string[] = [
    ...sections.map((s) => `Sección “${s.key}” de ${s.page.title}`),
    ...programs.map((p) => `Programa: ${p.name}`),
    ...timeline.map((t) => `Trayectoria: ${t.title}`),
    ...testimonials.map((t) => `Testimonio: ${t.name}`),
    ...cases.map((c) => `Caso de éxito: ${c.person}`),
    ...seo.map((s) => `SEO: ${s.path}`),
    ...settings.map(() => "Configuración del sitio"),
  ];

  return usage;
}

export async function deleteMedia(id: string) {
  const user = await requireUser();
  const usage = await mediaUsage(id);
  if (usage.length > 0) {
    return { error: `No se puede eliminar: el archivo se usa en ${usage.length} lugar(es).`, usage };
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { error: "Archivo no encontrado." };

  await deleteBlob(media.blobUrl).catch(() => undefined);
  if (media.originalUrl) await deleteBlob(media.originalUrl).catch(() => undefined);
  await prisma.media.delete({ where: { id } });

  await audit(user, "DELETE", "Media", id, { fileName: media.fileName });
  revalidatePath("/admin/media");
  return { ok: true as const };
}

export type MediaListItem = {
  id: string;
  blobUrl: string;
  fileName: string;
  alt: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
};

/** Listado para el selector de imágenes y la biblioteca. */
export async function listMedia(query = "", take = 60): Promise<MediaListItem[]> {
  await requireUser();
  const q = query.trim();
  return prisma.media.findMany({
    where: {
      deletedAt: null,
      visibility: "PUBLIC",
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
    take,
    select: {
      id: true,
      blobUrl: true,
      fileName: true,
      alt: true,
      mimeType: true,
      width: true,
      height: true,
      size: true,
    },
  });
}

export async function getMediaById(id: string): Promise<MediaListItem | null> {
  await requireUser();
  return prisma.media.findUnique({
    where: { id },
    select: {
      id: true,
      blobUrl: true,
      fileName: true,
      alt: true,
      mimeType: true,
      width: true,
      height: true,
      size: true,
    },
  });
}
