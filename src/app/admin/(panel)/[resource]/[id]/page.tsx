import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResource } from "@/lib/resources";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ResourceEditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const isNew = id === "nuevo";
  let values: Record<string, unknown> = {};

  if (!isNew) {
    const model = (prisma as any)[resource.model];
    const row = await model.findUnique({
      where: { id },
      include: resource.relation ? { [resource.relation.field]: { orderBy: { sortOrder: "asc" } } } : undefined,
    });
    if (!row) notFound();

    values = { ...row };
    if (resource.relation) {
      values[resource.relation.field] = (row[resource.relation.field] as { label: string }[]).map((f) => f.label);
    }
    if (values.date instanceof Date) values.date = values.date.toISOString().slice(0, 10);
  }

  return (
    <>
      <AdminPageHeader
        title={isNew ? `Nuevo ${resource.singular.toLowerCase()}` : `Editar ${resource.singular.toLowerCase()}`}
        description={isNew ? undefined : String(values[resource.titleField] ?? "")}
      />
      <ResourceForm
        resource={{
          key: resource.key,
          singular: resource.singular,
          fields: resource.fields,
          description: resource.description,
        }}
        id={isNew ? null : id}
        values={values}
      />
    </>
  );
}
