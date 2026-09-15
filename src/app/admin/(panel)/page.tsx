import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ADMISSION_STATUS_LABELS, LEVEL_LABELS } from "@/lib/constants";
import { formatBytes, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Stat({ label, value, href, hint }: { label: string; value: string | number; href?: string; hint?: string }) {
  const content = (
    <>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-paper/40">{label}</p>
      <p className="mt-2 font-display text-3xl text-paper">{value}</p>
      {hint && <p className="mt-1 text-xs text-paper/40">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="block border border-paper/10 bg-ink-800/60 p-5 transition-colors hover:border-gold/40">
      {content}
    </Link>
  ) : (
    <div className="border border-paper/10 bg-ink-800/60 p-5">{content}</div>
  );
}

export default async function DashboardPage() {
  const [
    nuevas,
    pendientes,
    comprobantesPendientes,
    programasActivos,
    testimoniosPublicados,
    mediaAgg,
    ultimas,
    auditoria,
  ] = await Promise.all([
    prisma.admissionRequest.count({ where: { status: "NUEVA", deletedAt: null } }),
    prisma.admissionRequest.count({
      where: { status: { in: ["PENDIENTE", "CONTACTADA", "EVALUACION_AGENDADA", "PENDIENTE_DE_PAGO"] }, deletedAt: null },
    }),
    prisma.payment.count({ where: { status: "COMPROBANTE_RECIBIDO", deletedAt: null } }),
    prisma.program.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.testimonial.count({ where: { status: "PUBLISHED" } }),
    prisma.media.aggregate({ _sum: { size: true, originalSize: true }, _count: true, where: { deletedAt: null } }),
    prisma.admissionRequest.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, fullName: true, countryName: true, level: true, status: true, createdAt: true },
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stored = mediaAgg._sum.size ?? 0;
  const original = mediaAgg._sum.originalSize ?? 0;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Estado real del estudio: solicitudes, comprobantes y contenido publicado."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Solicitudes nuevas" value={nuevas} href="/admin/admisiones?estado=NUEVA" />
        <Stat label="Admisiones en curso" value={pendientes} href="/admin/admisiones" />
        <Stat label="Comprobantes a verificar" value={comprobantesPendientes} href="/admin/pagos" />
        <Stat label="Programas publicados" value={programasActivos} href="/admin/programas" />
        <Stat label="Testimonios publicados" value={testimoniosPublicados} href="/admin/testimonios" />
        <Stat label="Archivos en la biblioteca" value={mediaAgg._count} href="/admin/media" />
        <Stat
          label="Almacenamiento usado"
          value={formatBytes(stored)}
          href="/admin/media"
          hint={original > stored ? `Originales: ${formatBytes(original)}` : undefined}
        />
        <Stat
          label="Ahorro por compresión"
          value={original > stored ? `${Math.round(((original - stored) / original) * 100)}%` : "—"}
          hint={original > stored ? `${formatBytes(original)} → ${formatBytes(stored)}` : "Sin datos todavía"}
        />
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-paper/60">Últimas solicitudes</h2>
          {ultimas.length === 0 ? (
            <p className="text-sm text-paper/40">Todavía no llegaron solicitudes.</p>
          ) : (
            <ul className="divide-y divide-paper/8 border border-paper/10">
              {ultimas.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/admisiones/${a.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-paper/5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-paper">{a.fullName}</span>
                      <span className="block text-xs text-paper/40">
                        {[a.countryName, LEVEL_LABELS[a.level]].filter(Boolean).join(" · ")} ·{" "}
                        {formatDate(a.createdAt, { dateStyle: "short" })}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.14em] text-gold">
                      {ADMISSION_STATUS_LABELS[a.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-paper/60">Actividad reciente</h2>
          {auditoria.length === 0 ? (
            <p className="text-sm text-paper/40">Sin actividad registrada.</p>
          ) : (
            <ul className="divide-y divide-paper/8 border border-paper/10">
              {auditoria.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 p-4 text-xs">
                  <span className="min-w-0">
                    <span className="block truncate text-paper/75">
                      {log.action} · {log.entity}
                    </span>
                    <span className="block text-paper/35">{log.userEmail ?? "sistema"}</span>
                  </span>
                  <span className="shrink-0 text-paper/35">{formatDate(log.createdAt, { dateStyle: "short", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-10 text-xs text-paper/35">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-gold">
          Ver el sitio público <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </p>
    </>
  );
}
