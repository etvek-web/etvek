"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Select, Textarea } from "@/components/ui/field";
import { MediaPicker } from "@/components/admin/media-picker";
import { StringList } from "@/components/admin/string-list";
import { saveResource, type ResourceState } from "@/app/actions/resource";
import { ICON_NAMES } from "@/components/site/icon";
import type { FieldDef, ResourceDef } from "@/lib/resources";
import { slugify } from "@/lib/utils";

const INITIAL: ResourceState = { status: "idle" };

type Values = Record<string, unknown>;

function FieldControl({ field, values, error }: { field: FieldDef; values: Values; error?: string }) {
  const value = values[field.name];
  const str = value === null || value === undefined ? "" : String(value);

  if (field.type === "media") {
    return <MediaPicker name={field.name} label={field.label} defaultValue={str} />;
  }

  if (field.type === "stringList") {
    return <StringList name={field.name} label={field.label} defaultValue={(value as string[]) ?? []} />;
  }

  if (field.type === "boolean") {
    return (
      <div className="pt-6">
        <Checkbox name={field.name} defaultChecked={Boolean(value)} label={field.label} />
        {field.hint && <p className="mt-1.5 text-xs text-paper/45">{field.hint}</p>}
      </div>
    );
  }

  return (
    <Field label={field.label} error={error} hint={field.hint} required={field.required}>
      {(id) => {
        switch (field.type) {
          case "textarea":
          case "richtext":
            return (
              <Textarea
                id={id}
                name={field.name}
                defaultValue={str}
                rows={field.type === "richtext" ? 10 : 4}
                placeholder={field.placeholder}
              />
            );
          case "select":
            return (
              <Select id={id} name={field.name} defaultValue={str || field.options?.[0]?.value}>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            );
          case "icon":
            return (
              <Select id={id} name={field.name} defaultValue={str}>
                <option value="">Sin icono</option>
                {ICON_NAMES.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
            );
          case "number":
            return <Input id={id} name={field.name} type="number" defaultValue={str} inputMode="numeric" />;
          case "slug":
            return (
              <Input
                id={id}
                name={field.name}
                defaultValue={str}
                onBlur={(e) => {
                  e.target.value = slugify(e.target.value);
                }}
                placeholder={field.placeholder}
              />
            );
          default:
            return <Input id={id} name={field.name} defaultValue={str} placeholder={field.placeholder} maxLength={300} />;
        }
      }}
    </Field>
  );
}

export function ResourceForm({
  resource,
  id,
  values,
}: {
  resource: Pick<ResourceDef, "key" | "singular" | "fields" | "description">;
  id: string | null;
  values: Values;
}) {
  const router = useRouter();
  const action = saveResource.bind(null, resource.key, id);
  const [state, formAction, pending] = useActionState(action, INITIAL);

  useEffect(() => {
    if (state.status === "success" && !id) router.replace(`/admin/${resource.key}/${state.id}`);
    if (state.status === "success") router.refresh();
  }, [state, id, resource.key, router]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="space-y-8">
      {resource.description && <p className="max-w-2xl text-sm text-paper/50">{resource.description}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {resource.fields.map((field) => (
          <div key={field.name} className={field.colSpan === 2 ? "md:col-span-2" : undefined}>
            <FieldControl field={field} values={values} error={errors[field.name]} />
          </div>
        ))}
      </div>

      {state.status === "error" && <FieldError>{state.message}</FieldError>}
      {state.status === "success" && <p className="text-sm text-gold">{state.message}</p>}

      <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-paper/10 bg-ink/95 py-4 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <ButtonLink href={`/admin/${resource.key}`} variant="ghost">
          Volver al listado
        </ButtonLink>
      </div>
    </form>
  );
}
