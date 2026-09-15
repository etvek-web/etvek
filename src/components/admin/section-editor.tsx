"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, Loader2 } from "lucide-react";
import { movePageSection, savePageSection, type FormState } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Select, Textarea } from "@/components/ui/field";
import { MediaPicker } from "@/components/admin/media-picker";
import { ICON_NAMES } from "@/components/site/icon";

const INITIAL: FormState = { status: "idle" };

export type SectionValues = {
  id: string;
  key: string;
  kind: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageId: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaLabel2: string | null;
  ctaHref2: string | null;
  isVisible: boolean;
  status: string;
  sortOrder: number;
  items: { id: string; title: string; body: string | null; icon: string | null }[];
};

const KIND_LABELS: Record<string, string> = {
  HERO: "Hero",
  RICH_TEXT: "Texto",
  CREDENTIAL_STRIP: "Franja de credenciales",
  MANIFESTO: "Manifiesto",
  PILLARS: "Pilares",
  PROGRAM_GRID: "Grilla de programas",
  COUNTRY_COVERAGE: "Cobertura de países",
  TESTIMONIALS: "Testimonios",
  SUCCESS_CASES: "Casos de éxito",
  TIMELINE: "Trayectoria",
  BIO: "Biografía",
  CTA: "Llamado a la acción",
  FAQ: "Preguntas frecuentes",
  CONTACT_FORM: "Formulario de admisión",
  PAYMENT_INFO: "Modalidad de pago",
  SCHEDULER: "Agenda",
};

/** Las secciones dinámicas toman su contenido de otras pantallas del panel. */
const DYNAMIC_KINDS = new Set([
  "CREDENTIAL_STRIP",
  "PROGRAM_GRID",
  "COUNTRY_COVERAGE",
  "TESTIMONIALS",
  "SUCCESS_CASES",
  "TIMELINE",
  "CONTACT_FORM",
  "PAYMENT_INFO",
  "SCHEDULER",
]);

const SUPPORTS_ITEMS = new Set(["MANIFESTO", "PILLARS", "FAQ"]);

export function SectionEditor({ section, defaultOpen = false }: { section: SectionValues; defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState(section.items);
  const [pendingMove, startMove] = useTransition();
  const action = savePageSection.bind(null, section.id);
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const move = (direction: -1 | 1) =>
    startMove(async () => {
      await movePageSection(section.id, direction);
      router.refresh();
    });

  return (
    <section className="border border-paper/10 bg-ink-800/40">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} strokeWidth={1.5} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm text-paper">{section.title || KIND_LABELS[section.kind] || section.key}</span>
            <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-paper/35">
              {KIND_LABELS[section.kind] ?? section.kind} · {section.key}
              {!section.isVisible && " · oculta"}
            </span>
          </span>
        </button>

        <button type="button" disabled={pendingMove} onClick={() => move(-1)} aria-label="Subir sección" className="p-2 text-paper/50 hover:text-gold">
          <ArrowUp className="size-4" strokeWidth={1.5} />
        </button>
        <button type="button" disabled={pendingMove} onClick={() => move(1)} aria-label="Bajar sección" className="p-2 text-paper/50 hover:text-gold">
          <ArrowDown className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {open && (
        <form action={formAction} className="space-y-6 border-t border-paper/10 p-5">
          {DYNAMIC_KINDS.has(section.kind) && (
            <p className="border-l-2 border-clinic pl-3 text-xs leading-relaxed text-paper/45">
              El contenido de esta sección se administra desde su propia pantalla del panel. Acá sólo se editan el
              encabezado, la visibilidad y el orden.
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Eyebrow" error={errors.eyebrow}>
              {(id) => <Input id={id} name="eyebrow" defaultValue={section.eyebrow ?? ""} />}
            </Field>
            <Field label="Título" error={errors.title}>
              {(id) => <Input id={id} name="title" defaultValue={section.title ?? ""} />}
            </Field>
            <div className="md:col-span-2">
              <Field label="Subtítulo" error={errors.subtitle}>
                {(id) => <Textarea id={id} name="subtitle" defaultValue={section.subtitle ?? ""} rows={2} />}
              </Field>
            </div>

            {!DYNAMIC_KINDS.has(section.kind) && (
              <div className="md:col-span-2">
                <Field label="Cuerpo" error={errors.body} hint="Separá los párrafos con una línea en blanco.">
                  {(id) => <Textarea id={id} name="body" defaultValue={section.body ?? ""} rows={10} />}
                </Field>
              </div>
            )}

            <MediaPicker name="imageId" label="Imagen" defaultValue={section.imageId} folder={section.kind === "HERO" ? "hero" : "secciones"} />

            <div className="grid gap-5">
              <Field label="Texto del botón principal" error={errors.ctaLabel}>
                {(id) => <Input id={id} name="ctaLabel" defaultValue={section.ctaLabel ?? ""} />}
              </Field>
              <Field label="Enlace del botón principal" error={errors.ctaHref}>
                {(id) => <Input id={id} name="ctaHref" defaultValue={section.ctaHref ?? ""} placeholder="/contacto" />}
              </Field>
            </div>

            <Field label="Texto del botón secundario" error={errors.ctaLabel2}>
              {(id) => <Input id={id} name="ctaLabel2" defaultValue={section.ctaLabel2 ?? ""} />}
            </Field>
            <Field label="Enlace del botón secundario" error={errors.ctaHref2}>
              {(id) => <Input id={id} name="ctaHref2" defaultValue={section.ctaHref2 ?? ""} />}
            </Field>

            <Field label="Estado" error={errors.status}>
              {(id) => (
                <Select id={id} name="status" defaultValue={section.status}>
                  <option value="PUBLISHED">Publicada</option>
                  <option value="DRAFT">Borrador</option>
                </Select>
              )}
            </Field>
            <Field label="Orden" error={errors.sortOrder}>
              {(id) => <Input id={id} name="sortOrder" type="number" defaultValue={section.sortOrder} />}
            </Field>

            <div className="md:col-span-2">
              <Checkbox name="isVisible" defaultChecked={section.isVisible} label="Mostrar esta sección en la web" />
            </div>
          </div>

          {SUPPORTS_ITEMS.has(section.kind) && (
            <div className="border-t border-paper/10 pt-5">
              <p className="mb-4 text-[0.7rem] uppercase tracking-[0.14em] text-paper/45">Ítems de la sección</p>
              <div className="space-y-5">
                {items.map((item, index) => (
                  <div key={item.id || index} className="grid gap-4 border border-paper/10 p-4 md:grid-cols-2">
                    <Field label={`Título ${index + 1}`}>
                      {(id) => <Input id={id} name={`items.${index}.title`} defaultValue={item.title} />}
                    </Field>
                    <Field label="Icono">
                      {(id) => (
                        <Select id={id} name={`items.${index}.icon`} defaultValue={item.icon ?? ""}>
                          <option value="">Sin icono</option>
                          {ICON_NAMES.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Texto">
                        {(id) => <Textarea id={id} name={`items.${index}.body`} defaultValue={item.body ?? ""} rows={3} />}
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                      >
                        Quitar ítem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setItems((prev) => [...prev, { id: `nuevo-${prev.length}`, title: "", body: null, icon: null }])}
              >
                Agregar ítem
              </Button>
            </div>
          )}

          {state.status === "error" && <FieldError>{state.message}</FieldError>}
          {state.status === "success" && <p className="text-sm text-gold">{state.message}</p>}

          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {pending ? "Guardando…" : "Guardar sección"}
          </Button>
        </form>
      )}
    </section>
  );
}
