"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getResource } from "@/lib/resources";
import { revalidateContent } from "@/lib/cache";
import { slugify } from "@/lib/utils";

export type ResourceState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; id: string; message: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
function delegate(model: string): any {
  const d = (prisma as any)[model];
  if (!d) throw new Error(`Modelo desconocido: ${model}`);
  return d;
}

function formToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("__")) continue;
    if (key.endsWith("[]")) {
      const name = key.slice(0, -2);
      const list = (obj[name] as string[]) ?? [];
      if (String(value).trim()) list.push(String(value).trim());
      obj[name] = list;
      continue;
    }
    obj[key] = value;
  }
  return obj;
}

/** Guarda (crea o actualiza) cualquier recurso del CMS declarado en RESOURCES. */
export async function saveResource(
  resourceKey: string,
  id: string | null,
  _prev: ResourceState,
  formData: FormData,
): Promise<ResourceState> {
  const user = await requireUser();
  const resource = getResource(resourceKey);
  if (!resource) return { status: "error", message: "Recurso desconocido." };

  const raw = formToObject(formData);

  // Los checkboxes ausentes deben llegar como false, no como undefined.
  for (const field of resource.fields) {
    if (field.type === "boolean") raw[field.name] = raw[field.name] === "on" || raw[field.name] === "true";
    if (field.type === "stringList" && !raw[field.name]) raw[field.name] = [];
  }
  if (resource.key === "programas" && !raw.slug && typeof raw.name === "string") raw.slug = slugify(raw.name);

  const parsed = resource.schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors };
  }

  const data = { ...(parsed.data as Record<string, unknown>) };
  const relationValues = resource.relation ? ((data[resource.relation.field] as string[]) ?? []) : [];
  if (resource.relation) delete data[resource.relation.field];

  // Fecha opcional escrita como texto en el formulario.
  if ("date" in data && typeof data.date === "string") {
    const parsedDate = new Date(data.date);
    data.date = Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const model = delegate(resource.model);

  try {
    const saved = id
      ? await model.update({ where: { id }, data })
      : await model.create({ data });

    if (resource.relation) {
      const relModel = delegate(resource.relation.model);
      const fk = `${resource.model}Id`;
      await relModel.deleteMany({ where: { [fk]: saved.id } });
      if (relationValues.length) {
        await relModel.createMany({
          data: relationValues.map((label, index) => ({ [fk]: saved.id, label, sortOrder: index })),
        });
      }
    }

    await audit(user, id ? "UPDATE" : "CREATE", resource.singular, saved.id, { resource: resource.key });
    revalidateContent(resource.tag);
    revalidatePath(`/admin/${resource.key}`);

    return { status: "success", id: saved.id, message: id ? "Cambios guardados." : `${resource.singular} creado.` };
  } catch (error) {
    const message = (error as { code?: string }).code === "P2002"
      ? "Ya existe un registro con ese valor único (slug, código o email)."
      : "No se pudo guardar. Revisá los datos e intentá nuevamente.";
    return { status: "error", message };
  }
}

export async function deleteResource(resourceKey: string, id: string) {
  const user = await requireUser();
  const resource = getResource(resourceKey);
  if (!resource) return { error: "Recurso desconocido." };

  const model = delegate(resource.model);
  if (resource.softDelete) {
    const current = await model.findUnique({ where: { id } });
    // Si el modelo tiene slug único, se le agrega un sufijo al archivar: así el slug
    // original vuelve a estar disponible en lugar de chocar con P2002.
    const freedSlug =
      current && typeof current.slug === "string" ? { slug: `${current.slug}-archivado-${Date.now().toString(36)}` } : {};
    await model.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED", ...freedSlug } });
  } else {
    await model.delete({ where: { id } });
  }

  await audit(user, "DELETE", resource.singular, id, { soft: Boolean(resource.softDelete) });
  revalidateContent(resource.tag);
  revalidatePath(`/admin/${resource.key}`);
  return { ok: true as const };
}

export async function duplicateResource(resourceKey: string, id: string) {
  const user = await requireUser();
  const resource = getResource(resourceKey);
  if (!resource?.duplicable) return { error: "Este recurso no se puede duplicar." };

  const model = delegate(resource.model);
  const original = await model.findUnique({
    where: { id },
    include: resource.relation ? { [resource.relation.field]: true } : undefined,
  });
  if (!original) return { error: "Registro no encontrado." };

  const rest = { ...original };
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  if (resource.relation) delete rest[resource.relation.field];

  const data: Record<string, unknown> = { ...rest, status: "DRAFT" };
  data[resource.titleField] = `${original[resource.titleField]} (copia)`;
  if ("slug" in data) data.slug = `${String(data.slug)}-copia-${Date.now().toString(36)}`;

  const copy = await model.create({ data });

  if (resource.relation) {
    const relModel = delegate(resource.relation.model);
    const fk = `${resource.model}Id`;
    const items = (original[resource.relation.field] ?? []) as { label: string; sortOrder: number }[];
    if (items.length) {
      await relModel.createMany({
        data: items.map((item) => ({ [fk]: copy.id, label: item.label, sortOrder: item.sortOrder })),
      });
    }
  }

  await audit(user, "DUPLICATE", resource.singular, copy.id, { from: id });
  revalidatePath(`/admin/${resource.key}`);
  return { ok: true as const, id: copy.id };
}

/**
 * Reordena un registro moviéndolo una posición.
 * Normaliza primero todos los `sortOrder` a su posición real: si quedaron valores
 * duplicados o arbitrarios (se pueden escribir a mano en el formulario), un simple
 * intercambio produciría un orden inestable. Los registros archivados no participan,
 * porque tampoco aparecen en el listado.
 */
export async function moveResource(resourceKey: string, id: string, direction: -1 | 1) {
  const user = await requireUser();
  const resource = getResource(resourceKey);
  if (!resource?.sortable) return { error: "Este recurso no se puede reordenar." };

  const model = delegate(resource.model);
  const items: { id: string }[] = await model.findMany({
    where: resource.softDelete ? { deletedAt: null } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  const index = items.findIndex((i) => i.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return { ok: true as const };

  const reordered = [...items];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await prisma.$transaction(
    reordered.map((item, position) => model.update({ where: { id: item.id }, data: { sortOrder: position } })),
  );

  await audit(user, "REORDER", resource.singular, id);
  revalidateContent(resource.tag);
  revalidatePath(`/admin/${resource.key}`);
  return { ok: true as const };
}

export async function toggleResourceStatus(resourceKey: string, id: string, status: "PUBLISHED" | "DRAFT") {
  const user = await requireUser();
  const resource = getResource(resourceKey);
  if (!resource) return { error: "Recurso desconocido." };

  await delegate(resource.model).update({ where: { id }, data: { status } });
  await audit(user, status === "PUBLISHED" ? "PUBLISH" : "UNPUBLISH", resource.singular, id);
  revalidateContent(resource.tag);
  revalidatePath(`/admin/${resource.key}`);
  return { ok: true as const };
}
