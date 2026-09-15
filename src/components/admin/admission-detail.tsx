"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, Lock } from "lucide-react";
import { addAdmissionNote, archiveAdmission, updateAdmissionStatus, updatePaymentStatus } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/field";
import { ADMISSION_STATUS_LABELS, LEVEL_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";

type Admission = {
  id: string;
  fullName: string;
  email: string;
  dialCode: string;
  whatsapp: string;
  countryName: string | null;
  style: string | null;
  level: string;
  objective: string;
  programName: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

type Note = { id: string; body: string; author: string; createdAt: string };
type Payment = {
  id: string;
  currency: "ARS" | "USD";
  amount: number | null;
  reference: string | null;
  status: string;
  method: string | null;
  receiptId: string | null;
  receiptName: string | null;
  createdAt: string;
};

export function AdmissionDetail({
  admission,
  notes,
  payments,
}: {
  admission: Admission;
  notes: Note[];
  payments: Payment[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const rows: [string, string][] = [
    ["Email", admission.email],
    ["WhatsApp", `${admission.dialCode} ${admission.whatsapp}`],
    ["País", admission.countryName ?? "—"],
    ["Estilo / proyecto", admission.style ?? "—"],
    ["Nivel", LEVEL_LABELS[admission.level] ?? admission.level],
    ["Programa de interés", admission.programName ?? "—"],
    ["Origen", admission.source ?? "—"],
    ["Recibida", formatDate(admission.createdAt)],
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="border border-paper/10 bg-ink-800/50 p-6">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-paper/60">Datos de la solicitud</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-paper/35">{label}</dt>
                <dd className="mt-1 break-words text-sm text-paper/85">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-paper/10 pt-5">
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-paper/35">Objetivo principal</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-paper/80">{admission.objective}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${(admission.dialCode + admission.whatsapp).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center border border-paper/20 px-3.5 text-xs uppercase tracking-[0.12em] text-paper/80 hover:border-gold hover:text-gold"
            >
              Escribir por WhatsApp
            </a>
            <a
              href={`mailto:${admission.email}`}
              className="inline-flex h-9 items-center border border-paper/20 px-3.5 text-xs uppercase tracking-[0.12em] text-paper/80 hover:border-gold hover:text-gold"
            >
              Responder por email
            </a>
          </div>
        </section>

        <section className="border border-paper/10 bg-ink-800/50 p-6">
          <h2 className="mb-1 flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-paper/60">
            <Lock className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Notas internas
          </h2>
          <p className="mb-4 text-xs text-paper/35">Visibles sólo en el panel. Nunca se envían al alumno.</p>

          <form
            action={(formData) =>
              start(async () => {
                const result = await addAdmissionNote(admission.id, formData);
                setMessage("error" in result && result.error ? result.error : "Nota guardada.");
                router.refresh();
              })
            }
            className="space-y-3"
          >
            <Label htmlFor="note-body">Nueva nota</Label>
            <Textarea id="note-body" name="body" rows={3} maxLength={4000} required />
            <Button type="submit" size="sm" disabled={pending}>
              Agregar nota
            </Button>
          </form>

          {notes.length > 0 && (
            <ul className="mt-6 space-y-4">
              {notes.map((n) => (
                <li key={n.id} className="border-l-2 border-clinic pl-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-paper/75">{n.body}</p>
                  <p className="mt-1.5 text-[0.65rem] text-paper/35">
                    {n.author} · {formatDate(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-8">
        <section className="border border-paper/10 bg-ink-800/50 p-6">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-paper/60">Estado</h2>
          <form
            action={(formData) =>
              start(async () => {
                const result = await updateAdmissionStatus(admission.id, formData);
                setMessage("error" in result && result.error ? result.error : "Estado actualizado.");
                router.refresh();
              })
            }
            className="space-y-3"
          >
            <Select name="status" defaultValue={admission.status} aria-label="Estado de la admisión">
              {Object.entries(ADMISSION_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            <Button type="submit" size="sm" disabled={pending}>
              Actualizar estado
            </Button>
          </form>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-4"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("¿Archivar esta solicitud? Se conserva en la base para consulta.")) return;
              start(async () => {
                await archiveAdmission(admission.id);
                router.push("/admin/admisiones");
              });
            }}
          >
            Archivar solicitud
          </Button>
        </section>

        <section className="border border-paper/10 bg-ink-800/50 p-6">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-paper/60">Pagos y comprobantes</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-paper/40">Sin pagos registrados.</p>
          ) : (
            <ul className="space-y-5">
              {payments.map((p) => (
                <li key={p.id} className="border-t border-paper/8 pt-4 first:border-0 first:pt-0">
                  <p className="text-sm text-paper/85">
                    {p.amount != null ? formatPrice(p.amount, p.currency) : p.currency}
                    {p.method ? ` · ${p.method}` : ""}
                  </p>
                  {p.reference && <p className="mt-1 text-xs text-paper/50">Referencia / MTCN: {p.reference}</p>}
                  <p className="mt-1 text-[0.65rem] text-paper/35">{formatDate(p.createdAt)}</p>

                  {p.receiptId && (
                    <a
                      href={`/api/private-files/${p.receiptId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                    >
                      <FileText className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Ver comprobante ({p.receiptName})
                    </a>
                  )}

                  <form
                    action={(formData) =>
                      start(async () => {
                        await updatePaymentStatus(p.id, formData);
                        setMessage("Pago actualizado.");
                        router.refresh();
                      })
                    }
                    className="mt-3 flex gap-2"
                  >
                    <Select name="status" defaultValue={p.status} aria-label="Estado del pago" className="text-xs">
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" size="sm" variant="outline" disabled={pending}>
                      Guardar
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        {message && <p className="text-xs text-gold">{message}</p>}
      </div>
    </div>
  );
}
