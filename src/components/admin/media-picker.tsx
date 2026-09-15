"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ImageOff, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { MediaUploader } from "@/components/admin/media-uploader";
import { getMediaById, listMedia, type MediaListItem } from "@/app/actions/media";

/** Selector de imágenes: reutiliza los archivos ya subidos, nunca duplica un archivo por relación. */
export function MediaPicker({
  name,
  label,
  defaultValue,
  folder = "media",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [selected, setSelected] = useState<MediaListItem | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    startTransition(async () => setSelected(await getMediaById(value)));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => startTransition(async () => setItems(await listMedia(query))), 220);
    return () => clearTimeout(id);
  }, [open, query]);

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden border border-paper/15 bg-ink-700">
          {selected ? (
            <Image src={selected.blobUrl} alt={selected.alt || selected.fileName} fill sizes="96px" className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-paper/25">
              <ImageOff className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
            {selected ? "Cambiar imagen" : "Elegir imagen"}
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setValue("")}>
              Quitar
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6">
          <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col border border-paper/15 bg-ink-800">
            <div className="flex items-center justify-between border-b border-paper/10 px-5 py-4">
              <h2 className="text-sm uppercase tracking-[0.16em] text-paper/70">Biblioteca de medios</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-paper/60 hover:text-paper">
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <MediaUploader
                folder={folder}
                compact
                onUploaded={(id) => {
                  setValue(id);
                  setOpen(false);
                }}
              />

              <div className="relative mt-6">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/35" strokeWidth={1.5} />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o descripción"
                  className="pl-9"
                />
              </div>

              {pending && <p className="mt-4 text-xs text-paper/40">Cargando…</p>}

              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue(item.id);
                        setOpen(false);
                      }}
                      className="group block w-full text-left"
                    >
                      <span className="relative block aspect-square overflow-hidden border border-paper/10 group-hover:border-gold">
                        <Image
                          src={item.blobUrl}
                          alt={item.alt || item.fileName}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-cover"
                        />
                      </span>
                      <span className="mt-1.5 block truncate text-[0.7rem] text-paper/55">{item.fileName}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {!pending && items.length === 0 && (
                <p className="mt-6 text-sm text-paper/45">Todavía no hay imágenes cargadas.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
