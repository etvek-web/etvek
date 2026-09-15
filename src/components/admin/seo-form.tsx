"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { saveSeo, type FormState } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Textarea } from "@/components/ui/field";
import { MediaPicker } from "@/components/admin/media-picker";

const INITIAL: FormState = { status: "idle" };

export function SeoForm({
  path,
  values,
}: {
  path: string;
  values: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImageId: string | null;
    canonical: string;
    noindex: boolean;
  };
}) {
  const action = saveSeo.bind(null, path);
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <p className="text-xs text-paper/40">Ruta: {path}</p>

      <Field label="Meta title" error={errors.metaTitle} hint="Ideal: hasta 60 caracteres.">
        {(id) => <Input id={id} name="metaTitle" defaultValue={values.metaTitle} maxLength={120} />}
      </Field>

      <Field label="Meta description" error={errors.metaDescription} hint="Ideal: hasta 160 caracteres.">
        {(id) => <Textarea id={id} name="metaDescription" defaultValue={values.metaDescription} rows={3} maxLength={300} />}
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="OG title" error={errors.ogTitle}>
          {(id) => <Input id={id} name="ogTitle" defaultValue={values.ogTitle} maxLength={120} />}
        </Field>
        <Field label="Canonical" error={errors.canonical}>
          {(id) => <Input id={id} name="canonical" defaultValue={values.canonical} placeholder="https://…" />}
        </Field>
      </div>

      <Field label="OG description" error={errors.ogDescription}>
        {(id) => <Textarea id={id} name="ogDescription" defaultValue={values.ogDescription} rows={3} maxLength={300} />}
      </Field>

      <MediaPicker name="ogImageId" label="Imagen Open Graph" defaultValue={values.ogImageId} folder="og" />

      <Checkbox name="noindex" defaultChecked={values.noindex} label="No indexar esta página (noindex, nofollow)" />

      {state.status === "error" && <FieldError>{state.message}</FieldError>}
      {state.status === "success" && <p className="text-sm text-gold">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
