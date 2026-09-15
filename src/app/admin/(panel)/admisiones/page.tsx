import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ADMISSION_STATUS_LABELS, LEVEL_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AdmissionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const valid = estado && estado in ADMISSION_STATUS_LABELS ? (estado as AdmissionStatus) : undefined;

  const rows = await prisma.admissionRequest.findMany({
    where: { deletedAt: null, ...(valid ? { status: valid } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { program: { select: { name: true } }, _count: { select: { payments: true } } },
  });

  return (
    <>
      <AdminPageHeader title="Solicitudes de admisión" description="Cada solicitud enviada desde el formulario público." />

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/admisiones"
          className={`border px-3 py-1.5 ${!valid ? "border-gold text-gold" : "border-paper/15 text-paper/55 hover:text-paper"}`}
        >
          Todas
        </Link>
        {Object.entries(ADMISSION_STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/admisiones?estado=${key}`}
            className={`border px-3 py-1.5 ${valid === key ? "border-gold text-gold" : "border-paper/15 text-paper/55 hover:text-paper"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="border border-dashed border-paper/15 p-8 text-center text-sm text-paper/45">
          No hay solicitudes con este filtro.
        </p>
      ) : (
        <div className="overflow-x-auto border border-paper/10">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-paper/10 text-[0.65rem] uppercase tracking-[0.14em] text-paper/40">
                <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 font-medium">País</th>
                <th scope="col" className="px-4 py-3 font-medium">Nivel</th>
                <th scope="col" className="px-4 py-3 font-medium">Programa</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/8">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-paper/4">
                  <td className="px-4 py-3">
                    <Link href={`/admin/admisiones/${a.id}`} className="text-paper hover:text-gold">
                      {a.fullName}
                    </Link>
                    <span className="block text-xs text-paper/35">{a.email}</span>
                  </td>
                  <td className="px-4 py-3 text-paper/55">{a.countryName ?? "—"}</td>
                  <td className="px-4 py-3 text-paper/55">{LEVEL_LABELS[a.level]}</td>
                  <td className="px-4 py-3 text-paper/55">{a.program?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-[0.65rem] uppercase tracking-[0.14em] text-gold">
                      {ADMISSION_STATUS_LABELS[a.status]}
                    </span>
                    {a._count.payments > 0 && <span className="ml-2 text-[0.65rem] text-paper/35">{a._count.payments} pago(s)</span>}
                  </td>
                  <td className="px-4 py-3 text-paper/40">{formatDate(a.createdAt, { dateStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
