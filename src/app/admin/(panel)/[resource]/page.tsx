import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResource, RESOURCE_KEYS } from "@/lib/resources";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RowActions } from "@/components/admin/row-actions";
import { STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return RESOURCE_KEYS.map((resource) => ({ resource }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ResourceListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const model = (prisma as any)[resource.model];
  const rows: Record<string, any>[] = await model.findMany({
    where: resource.softDelete ? { deletedAt: null } : undefined,
    orderBy: resource.sortable ? [{ sortOrder: "asc" }, { createdAt: "asc" }] : { createdAt: "desc" },
  });

  const render = (row: Record<string, any>, column: string) => {
    const value = row[column];
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (column === "status") return STATUS_LABELS[String(value)] ?? String(value);
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  };

  return (
    <>
      <AdminPageHeader
        title={resource.label}
        description={resource.description}
        action={{ href: `/admin/${resource.key}/nuevo`, label: `Nuevo ${resource.singular.toLowerCase()}` }}
      />

      {rows.length === 0 ? (
        <p className="border border-dashed border-paper/15 p-8 text-center text-sm text-paper/45">
          Todavía no hay registros. Creá el primero con el botón de arriba.
        </p>
      ) : (
        <div className="overflow-x-auto border border-paper/10">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-paper/10 text-[0.65rem] uppercase tracking-[0.14em] text-paper/40">
                {resource.listColumns.map((c) => (
                  <th key={c.name} scope="col" className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/8">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-paper/4">
                  {resource.listColumns.map((c, i) => (
                    <td key={c.name} className="px-4 py-3 align-middle">
                      {i === 0 ? (
                        <Link href={`/admin/${resource.key}/${row.id}`} className="text-paper hover:text-gold">
                          {render(row, c.name)}
                        </Link>
                      ) : (
                        <span className="text-paper/55">{render(row, c.name)}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <RowActions
                      resourceKey={resource.key}
                      id={row.id}
                      status={"status" in row ? String(row.status) : undefined}
                      sortable={resource.sortable}
                      duplicable={resource.duplicable}
                      title={String(row[resource.titleField])}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
