"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitAdmission, type AdmissionActionState } from "@/app/actions/admission";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Select, Textarea } from "@/components/ui/field";
import { ReceiptUpload } from "@/components/site/receipt-upload";
import { trackEvent } from "@/lib/track";

type Country = { id: string; name: string; dialCode: string; flag: string | null };
type Program = { id: string; name: string; slug: string };

const INITIAL: AdmissionActionState = { status: "idle" };

export function AdmissionForm({ countries, programs }: { countries: Country[]; programs: Program[] }) {
  const params = useSearchParams();
  const programSlug = params.get("programa");
  const preselected = programs.find((p) => p.slug === programSlug);

  const [state, formAction, pending] = useActionState(submitAdmission, INITIAL);
  const [countryId, setCountryId] = useState(countries[0]?.id ?? "");
  const dialCode = countries.find((c) => c.id === countryId)?.dialCode ?? "+54";

  useEffect(() => {
    if (state.status === "success") trackEvent("admission_submitted");
  }, [state.status]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div className="border border-gold/30 bg-ink-800/60 p-8 sm:p-10">
        <CheckCircle2 className="size-8 text-gold" strokeWidth={1.25} aria-hidden="true" />
        <h3 className="mt-5 text-2xl text-paper">Recibimos tu solicitud</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/60">
          Eliana revisa personalmente cada admisión. Te vamos a contactar por email o WhatsApp para coordinar el
          próximo paso.
        </p>
        <div className="mt-8 border-t border-paper/10 pt-8">
          <h4 className="text-sm font-medium tracking-wide text-paper">¿Ya realizaste el pago?</h4>
          <p className="mt-2 text-sm text-paper/55">
            Podés cargar tu comprobante o el código MTCN ahora. El archivo se guarda de forma privada: no queda
            accesible desde ninguna URL pública.
          </p>
          <ReceiptUpload token={state.receiptToken} />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Honeypot anti-spam: invisible para personas, visible para bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">No completar</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nombre completo" required error={errors.fullName}>
          {(id) => <Input id={id} name="fullName" autoComplete="name" required maxLength={120} />}
        </Field>

        <Field label="Email" required error={errors.email}>
          {(id) => <Input id={id} name="email" type="email" autoComplete="email" required inputMode="email" />}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="País de residencia" required error={errors.countryId}>
          {(id) => (
            <Select id={id} name="countryId" required value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag ? `${c.flag} ` : ""}
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="WhatsApp" required error={errors.whatsapp ?? errors.dialCode} hint="Sin 0 ni 15.">
          {(id) => (
            <div className="flex gap-2">
              <input type="hidden" name="dialCode" value={dialCode} />
              <span className="inline-flex h-11 shrink-0 items-center border border-paper/15 bg-ink-700/60 px-3 text-sm text-paper/60">
                {dialCode}
              </span>
              <Input id={id} name="whatsapp" inputMode="tel" autoComplete="tel-national" required maxLength={20} />
            </div>
          )}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Estilo musical / Proyecto" error={errors.style}>
          {(id) => <Input id={id} name="style" maxLength={160} placeholder="Lírico, pop, rock, teatro musical…" />}
        </Field>

        <Field label="Nivel" required error={errors.level}>
          {(id) => (
            <Select id={id} name="level" required defaultValue="PROFESIONAL">
              <option value="PROFESIONAL">Profesional</option>
              <option value="SEMI_PROFESIONAL">Semi-profesional</option>
              <option value="OTRO">Otro</option>
            </Select>
          )}
        </Field>
      </div>

      {programs.length > 0 && (
        <Field label="Programa de interés" error={errors.programId}>
          {(id) => (
            <Select
              id={id}
              name="programId"
              defaultValue={preselected?.id ?? ""}
              onChange={() => trackEvent("program_selected")}
            >
              <option value="">Todavía no lo sé</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <Field
        label="Objetivo principal"
        required
        error={errors.objective}
        hint="Contanos qué querés lograr con tu voz y qué dificultades estás atravesando."
      >
        {(id) => <Textarea id={id} name="objective" required maxLength={2000} rows={5} />}
      </Field>

      <input type="hidden" name="source" value={programSlug ?? "web"} />

      <Checkbox
        name="consent"
        required
        label={
          <>
            Acepto que ETVEK utilice estos datos para evaluar mi admisión y contactarme. Leí la{" "}
            <a href="/privacidad" className="text-gold underline-offset-4 hover:underline">
              política de privacidad
            </a>
            .
          </>
        }
      />
      <FieldError>{errors.consent}</FieldError>

      {state.status === "error" && !state.fieldErrors && <FieldError>{state.message}</FieldError>}

      <Button type="submit" size="lg" disabled={pending} onClick={() => trackEvent("evaluacion_click")}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Enviando…" : "Solicitar Evaluación Vocal"}
      </Button>
    </form>
  );
}
