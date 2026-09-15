"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidateContent, TAGS } from "@/lib/cache";
import {
  admissionUpdateSchema,
  noteSchema,
  paymentStatusEnum,
  sectionSchema,
  seoSchema,
  settingsSchema,
} from "@/lib/validation";

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; message: string };

function collect(formData: FormData) {
  const obj: Record<string, unknown> = {};
  const items: { title: string; body: string | null; icon: string | null }[] = [];

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^items\.(\d+)\.(title|body|icon)$/);
    if (match) {
      const index = Number(match[1]);
      items[index] ??= { title: "", body: null, icon: null };
      const field = match[2] as "title" | "body" | "icon";
      const str = String(value);
      if (field === "title") items[index].title = str;
      else items[index][field] = str || null;
      continue;
    }
    obj[key] = value;
  }

  obj.items = items.filter((i) => i && i.title.trim());
  return obj;
}

function fieldErrorsOf(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return errors;
}

/** Guarda una sección de página del CMS (textos, imagen, CTA, visibilidad, ítems). */
export async function savePageSection(sectionId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = collect(formData);
  raw.isVisible = raw.isVisible === "on" || raw.isVisible === "true";

  const parsed = sectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }

  const { items, ...data } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.pageSection.update({ where: { id: sectionId }, data });
    await tx.pageSectionItem.deleteMany({ where: { sectionId } });
    if (items.length) {
      await tx.pageSectionItem.createMany({
        data: items.map((item, index) => ({
          sectionId,
          title: item.title,
          body: item.body ?? null,
          icon: item.icon ?? null,
          sortOrder: index,
        })),
      });
    }
  });

  const section = await prisma.pageSection.findUnique({ where: { id: sectionId }, include: { page: true } });
  await audit(user, "UPDATE", "PageSection", sectionId, { key: section?.key, page: section?.page.slug });
  revalidateContent(TAGS.pages);
  revalidatePath(`/admin/sitio/${section?.page.slug ?? ""}`);
  return { status: "success", message: "Sección actualizada." };
}

export async function movePageSection(sectionId: string, direction: -1 | 1) {
  const user = await requireUser();
  const section = await prisma.pageSection.findUniqueOrThrow({ where: { id: sectionId } });
  const siblings = await prisma.pageSection.findMany({
    where: { pageId: section.pageId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  const index = siblings.findIndex((s) => s.id === sectionId);
  const target = index + direction;
  if (target < 0 || target >= siblings.length) return { ok: true as const };

  await prisma.$transaction([
    prisma.pageSection.update({ where: { id: siblings[index].id }, data: { sortOrder: target } }),
    prisma.pageSection.update({ where: { id: siblings[target].id }, data: { sortOrder: index } }),
  ]);

  await audit(user, "REORDER", "PageSection", sectionId);
  revalidateContent(TAGS.pages);
  return { ok: true as const };
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  for (const key of ["whatsappEnabled", "schedulerEnabled", "analyticsEnabled", "maintenanceMode"]) {
    raw[key] = raw[key] === "on" || raw[key] === "true";
  }

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  await audit(user, "UPDATE", "SiteSettings", "singleton");
  revalidateContent();
  return { status: "success", message: "Configuración guardada." };
}

export async function saveSeo(path: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  raw.noindex = raw.noindex === "on" || raw.noindex === "true";
  raw.path = path;

  const parsed = seoSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }

  const { path: seoPath, ...data } = parsed.data;
  await prisma.seoMetadata.upsert({ where: { path: seoPath }, update: data, create: { path: seoPath, ...data } });

  await audit(user, "UPDATE", "SeoMetadata", seoPath);
  revalidateContent(TAGS.seo);
  return { status: "success", message: "SEO actualizado." };
}

export async function updateAdmissionStatus(admissionId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = admissionUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Estado inválido." };

  await prisma.admissionRequest.update({ where: { id: admissionId }, data: { status: parsed.data.status } });
  await audit(user, "UPDATE_STATUS", "AdmissionRequest", admissionId, { status: parsed.data.status });
  revalidatePath(`/admin/admisiones/${admissionId}`);
  return { ok: true as const };
}

/** Nota interna: sólo visible en el panel, nunca se envía al alumno. */
export async function addAdmissionNote(admissionId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = noteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nota inválida." };

  await prisma.admissionNote.create({ data: { admissionId, authorId: user.id, body: parsed.data.body } });
  await audit(user, "CREATE", "AdmissionNote", admissionId);
  revalidatePath(`/admin/admisiones/${admissionId}`);
  return { ok: true as const };
}

export async function archiveAdmission(admissionId: string) {
  const user = await requireUser();
  await prisma.admissionRequest.update({
    where: { id: admissionId },
    data: { deletedAt: new Date(), status: "CERRADA" },
  });
  await audit(user, "ARCHIVE", "AdmissionRequest", admissionId);
  revalidatePath("/admin/admisiones");
  return { ok: true as const };
}

export async function updatePaymentStatus(paymentId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = paymentStatusEnum.safeParse(formData.get("status"));
  if (!parsed.success) return { error: "Estado inválido." };

  const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status: parsed.data } });
  if (parsed.data === "VERIFICADO" && payment.admissionId) {
    await prisma.admissionRequest.update({ where: { id: payment.admissionId }, data: { status: "CONFIRMADA" } });
  }

  await audit(user, "UPDATE_STATUS", "Payment", paymentId, { status: parsed.data });
  revalidatePath("/admin/pagos");
  return { ok: true as const };
}
