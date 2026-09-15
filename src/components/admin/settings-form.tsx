"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveSettings, type FormState } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Select, Textarea } from "@/components/ui/field";
import { MediaPicker } from "@/components/admin/media-picker";

const INITIAL: FormState = { status: "idle" };

export type SettingsValues = {
  siteName: string;
  tagline: string | null;
  contactEmail: string;
  whatsappNumber: string | null;
  whatsappMessage: string;
  whatsappProgramMessage: string;
  whatsappEnabled: boolean;
  schedulerUrl: string | null;
  schedulerProvider: string;
  schedulerEnabled: boolean;
  logoId: string | null;
  defaultOgImageId: string | null;
  analyticsEnabled: boolean;
  colorBackground: string;
  colorPrimary: string;
  colorAccent: string;
  colorSurface: string;
  maintenanceMode: boolean;
  legalReviewNote: string | null;
};

export type SettingsGroup = "general" | "apariencia" | "agenda";

const GROUP_FIELDS: Record<SettingsGroup, (keyof SettingsValues)[]> = {
  general: [
    "siteName",
    "tagline",
    "contactEmail",
    "whatsappEnabled",
    "whatsappNumber",
    "whatsappMessage",
    "whatsappProgramMessage",
    "analyticsEnabled",
    "maintenanceMode",
    "legalReviewNote",
  ],
  apariencia: ["logoId", "defaultOgImageId", "colorBackground", "colorPrimary", "colorAccent", "colorSurface"],
  agenda: ["schedulerEnabled", "schedulerProvider", "schedulerUrl"],
};

const BOOLEANS = new Set<keyof SettingsValues>([
  "whatsappEnabled",
  "schedulerEnabled",
  "analyticsEnabled",
  "maintenanceMode",
]);

/** Un único formulario de ajustes, presentado por grupos. Los campos fuera del grupo viajan intactos. */
export function SettingsForm({ values, group }: { values: SettingsValues; group: SettingsGroup }) {
  const [state, formAction, pending] = useActionState(saveSettings, INITIAL);
  const visible = new Set(GROUP_FIELDS[group]);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const hidden = (Object.keys(values) as (keyof SettingsValues)[]).filter((k) => !visible.has(k));

  return (
    <form action={formAction} className="space-y-8">
      {hidden.map((key) =>
        BOOLEANS.has(key) ? (
          <input key={key} type="hidden" name={key} value={values[key] ? "true" : "false"} />
        ) : (
          <input key={key} type="hidden" name={key} value={(values[key] as string | null) ?? ""} />
        ),
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {group === "general" && (
          <>
            <Field label="Nombre del sitio" required error={errors.siteName}>
              {(id) => <Input id={id} name="siteName" defaultValue={values.siteName} required />}
            </Field>
            <Field label="Bajada / tagline" error={errors.tagline}>
              {(id) => <Input id={id} name="tagline" defaultValue={values.tagline ?? ""} />}
            </Field>
            <Field label="Email de contacto" required error={errors.contactEmail} hint="Recibe los avisos de nuevas admisiones.">
              {(id) => <Input id={id} name="contactEmail" type="email" defaultValue={values.contactEmail} required />}
            </Field>
            <Field
              label="Número de WhatsApp"
              error={errors.whatsappNumber}
              hint="Con código de país, sin espacios ni signos. Ej.: 5491122334455"
            >
              {(id) => <Input id={id} name="whatsappNumber" defaultValue={values.whatsappNumber ?? ""} inputMode="tel" />}
            </Field>
            <div className="md:col-span-2">
              <Field label="Mensaje inicial de WhatsApp" required error={errors.whatsappMessage}>
                {(id) => <Textarea id={id} name="whatsappMessage" defaultValue={values.whatsappMessage} rows={3} required />}
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field
                label="Mensaje de WhatsApp por programa"
                required
                error={errors.whatsappProgramMessage}
                hint="Se usa cuando la persona llega desde un programa concreto. {programa} se reemplaza por el nombre del plan."
              >
                {(id) => (
                  <Textarea
                    id={id}
                    name="whatsappProgramMessage"
                    defaultValue={values.whatsappProgramMessage}
                    rows={2}
                    required
                  />
                )}
              </Field>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Checkbox name="whatsappEnabled" defaultChecked={values.whatsappEnabled} label="Mostrar el botón flotante de WhatsApp" />
              <Checkbox
                name="analyticsEnabled"
                defaultChecked={values.analyticsEnabled}
                label="Registrar conversiones internas y Vercel Analytics (sin datos personales ni contenido de formularios)"
              />
              <Checkbox name="maintenanceMode" defaultChecked={values.maintenanceMode} label="Modo mantenimiento" />
            </div>
            <div className="md:col-span-2">
              <Field label="Nota sobre textos legales" error={errors.legalReviewNote}>
                {(id) => <Textarea id={id} name="legalReviewNote" defaultValue={values.legalReviewNote ?? ""} rows={3} />}
              </Field>
            </div>
          </>
        )}

        {group === "apariencia" && (
          <>
            <MediaPicker name="logoId" label="Logo" defaultValue={values.logoId} folder="marca" />
            <MediaPicker name="defaultOgImageId" label="Imagen Open Graph por defecto" defaultValue={values.defaultOgImageId} folder="og" />
            {(
              [
                ["colorBackground", "Fondo (Negro Azabache)"],
                ["colorPrimary", "Primario (Azul Clínico)"],
                ["colorAccent", "Acento (Dorado Tenue)"],
                ["colorSurface", "Texto / superficie (Blanco)"],
              ] as const
            ).map(([name, label]) => (
              <Field key={name} label={label} error={errors[name]}>
                {(id) => (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label={`${label} (selector)`}
                      defaultValue={values[name]}
                      onChange={(e) => {
                        const input = document.getElementById(id) as HTMLInputElement | null;
                        if (input) input.value = e.target.value.toUpperCase();
                      }}
                      className="h-11 w-14 cursor-pointer border border-paper/15 bg-ink-700"
                    />
                    <Input id={id} name={name} defaultValue={values[name]} pattern="^#[0-9a-fA-F]{6}$" />
                  </div>
                )}
              </Field>
            ))}
          </>
        )}

        {group === "agenda" && (
          <>
            <div className="md:col-span-2">
              <Checkbox
                name="schedulerEnabled"
                defaultChecked={values.schedulerEnabled}
                label="Mostrar el widget de agenda en la web"
              />
            </div>
            <Field label="Proveedor" error={errors.schedulerProvider}>
              {(id) => (
                <Select id={id} name="schedulerProvider" defaultValue={values.schedulerProvider}>
                  <option value="calendly">Calendly</option>
                  <option value="savvycal">SavvyCal</option>
                </Select>
              )}
            </Field>
            <Field
              label="URL de la agenda"
              error={errors.schedulerUrl}
              hint="Pegá el enlace público de tu calendario. La zona horaria se detecta automáticamente."
            >
              {(id) => <Input id={id} name="schedulerUrl" defaultValue={values.schedulerUrl ?? ""} placeholder="https://calendly.com/…" />}
            </Field>
          </>
        )}
      </div>

      {state.status === "error" && <FieldError>{state.message}</FieldError>}
      {state.status === "success" && <p className="text-sm text-gold">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
