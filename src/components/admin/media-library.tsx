"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Search, Trash2 } from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { deleteMedia, mediaUsage, updateMedia } from "@/app/actions/media";
import { formatBytes, formatDate, savingsPercent } from "@/lib/utils";

export type MediaItem = {
  id: string;
  blobUrl: string;
  fileName: string;
  alt: string;
  description: string | null;
  folder: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  originalSize: number | null;
  createdAt: string;
};

export function MediaLibrary({ items, initialQuery }: { items: MediaItem[]; initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [usage, setUsage] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function openDetail(item: MediaItem) {
    setSelected(item);
    setMessage(null);
    setUsage(null);
    start(async () => setUsage(await mediaUsage(item.id)));
  }

  return (
    <div className="space-y-8">
      <MediaUploader onUploaded={() => router.refresh()} />

      <form
        action="/admin/media"
        className="relative max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/admin/media?q=${encodeURIComponent(query)}`);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/35" strokeWidth={1.5} />
        <Input name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar archivos" className="pl-9" />
      </form>

      {items.length === 0 ? (
        <p className="border border-dashed border-paper/15 p-8 text-center text-sm text-paper/45">
          No hay archivos que coincidan con la búsqueda.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => openDetail(item)} className="group block w-full text-left">
                <span className="relative block aspect-square overflow-hidden border border-paper/10 group-hover:border-gold">
                  <Image src={item.blobUrl} alt={item.alt || item.fileName} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                </span>
                <span className="mt-2 block truncate text-xs text-paper/70">{item.fileName}</span>
                <span className="block text-[0.65rem] text-paper/35">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {formatBytes(item.size)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6">
          <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto border border-paper/15 bg-ink-800 p-6">
            <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-square w-full overflow-hidden border border-paper/10">
                <Image src={selected.blobUrl} alt={selected.alt || selected.fileName} fill sizes="200px" className="object-cover" />
              </div>

              <div>
                <h2 className="truncate text-sm text-paper">{selected.fileName}</h2>
                <dl className="mt-3 space-y-1 text-xs text-paper/45">
                  <div className="flex gap-2">
                    <dt>Formato:</dt>
                    <dd>{selected.mimeType}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>Dimensiones:</dt>
                    <dd>{selected.width && selected.height ? `${selected.width}×${selected.height}` : "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>Peso:</dt>
                    <dd>
                      {formatBytes(selected.size)}
                      {selected.originalSize && selected.originalSize > selected.size
                        ? ` (original ${formatBytes(selected.originalSize)} · −${savingsPercent(selected.originalSize, selected.size)}%)`
                        : ""}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt>Subido:</dt>
                    <dd>{formatDate(selected.createdAt)}</dd>
                  </div>
                </dl>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    void navigator.clipboard.writeText(selected.blobUrl);
                    setMessage("URL copiada.");
                  }}
                >
                  <Copy className="size-4" strokeWidth={1.5} /> Copiar URL pública
                </Button>
              </div>
            </div>

            <form
              className="mt-6 space-y-4"
              action={(formData) =>
                start(async () => {
                  const result = await updateMedia(selected.id, formData);
                  setMessage("error" in result ? result.error! : "Cambios guardados.");
                  router.refresh();
                })
              }
            >
              <div>
                <Label htmlFor="alt">Texto alternativo</Label>
                <Input id="alt" name="alt" defaultValue={selected.alt} maxLength={300} />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" defaultValue={selected.description ?? ""} rows={3} />
              </div>
              <div>
                <Label htmlFor="folder">Carpeta</Label>
                <Input id="folder" name="folder" defaultValue={selected.folder ?? ""} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={pending}>
                  Guardar
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
                  Cerrar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={pending || (usage?.length ?? 0) > 0}
                  onClick={() => {
                    if (!window.confirm(`¿Eliminar “${selected.fileName}” de forma permanente?`)) return;
                    start(async () => {
                      const result = await deleteMedia(selected.id);
                      if ("error" in result && result.error) {
                        setMessage(result.error);
                        return;
                      }
                      setSelected(null);
                      router.refresh();
                    });
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.5} /> Eliminar
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-paper/10 pt-4 text-xs">
              <p className="text-paper/45">Dónde se usa</p>
              {usage === null ? (
                <p className="mt-1 text-paper/35">Verificando…</p>
              ) : usage.length === 0 ? (
                <p className="mt-1 text-paper/35">No se usa en ninguna sección. Se puede eliminar sin romper la web.</p>
              ) : (
                <ul className="mt-1 space-y-0.5 text-paper/60">
                  {usage.map((u, i) => (
                    <li key={i}>· {u}</li>
                  ))}
                </ul>
              )}
            </div>

            {message && <p className="mt-4 text-xs text-gold">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
