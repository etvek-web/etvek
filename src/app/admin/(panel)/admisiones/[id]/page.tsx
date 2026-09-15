import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdmissionDetail } from "@/components/admin/admission-detail";

export const dynamic = "force-dynamic";

export default async function AdmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admission = await prisma.admissionRequest.findUnique({
    where: { id },
    include: {
      program: { select: { name: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      payments: { include: { receipt: true, method: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!admission) notFound();

  return (
    <>
      <AdminPageHeader title={admission.fullName} description={admission.email} />
      <p className="mb-6 text-xs">
        <Link href="/admin/admisiones" className="text-paper/45 hover:text-gold">
          ← Volver a solicitudes
        </Link>
      </p>

      <AdmissionDetail
        admission={{
          id: admission.id,
          fullName: admission.fullName,
          email: admission.email,
          dialCode: admission.dialCode,
          whatsapp: admission.whatsapp,
          countryName: admission.countryName,
          style: admission.style,
          level: admission.level,
          objective: admission.objective,
          programName: admission.program?.name ?? null,
          source: admission.source,
          status: admission.status,
          createdAt: admission.createdAt.toISOString(),
        }}
        notes={admission.notes.map((n) => ({
          id: n.id,
          body: n.body,
          author: n.author?.name ?? "—",
          createdAt: n.createdAt.toISOString(),
        }))}
        payments={admission.payments.map((p) => ({
          id: p.id,
          currency: p.currency,
          amount: p.amount,
          reference: p.reference,
          status: p.status,
          method: p.method?.name ?? null,
          receiptId: p.receiptId,
          receiptName: p.receipt?.fileName ?? null,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
