import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admission: { select: { id: true, fullName: true } },
      program: { select: { name: true } },
      method: { select: { name: true } },
      receipt: { select: { id: true, fileName: true } },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Pagos y comprobantes"
        description="Los comprobantes se guardan como archivos privados: sólo se abren desde acá, con sesión iniciada."
      />

      {payments.length === 0 ? (
        <p className="border border-dashed border-paper/15 p-8 text-center text-sm text-paper/45">
          Todavía no se registraron pagos.
        </p>
      ) : (
        <div className="overflow-x-auto border border-paper/10">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-paper/10 text-[0.65rem] uppercase tracking-[0.14em] text-paper/40">
                <th scope="col" className="px-4 py-3 font-medium">Solicitante</th>
                <th scope="col" className="px-4 py-3 font-medium">Programa</th>
                <th scope="col" className="px-4 py-3 font-medium">Monto</th>
                <th scope="col" className="px-4 py-3 font-medium">Referencia</th>
                <th scope="col" className="px-4 py-3 font-medium">Comprobante</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/8">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-paper/4">
                  <td className="px-4 py-3">
                    {p.admission ? (
                      <Link href={`/admin/admisiones/${p.admission.id}`} className="text-paper hover:text-gold">
                        {p.admission.fullName}
                      </Link>
                    ) : (
                      <span className="text-paper/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-paper/55">{p.program?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-paper/55">
                    {p.amount != null ? formatPrice(p.amount, p.currency) : p.currency}
                  </td>
                  <td className="px-4 py-3 text-paper/55">{p.reference ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.receipt ? (
                      <a
                        href={`/api/private-files/${p.receipt.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                      >
                        <FileText className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Ver
                      </a>
                    ) : (
                      <span className="text-paper/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[0.65rem] uppercase tracking-[0.14em] text-gold">
                    {PAYMENT_STATUS_LABELS[p.status]}
                  </td>
                  <td className="px-4 py-3 text-paper/40">{formatDate(p.createdAt, { dateStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
