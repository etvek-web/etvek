"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteResource, duplicateResource, moveResource, toggleResourceStatus } from "@/app/actions/resource";

export function RowActions({
  resourceKey,
  id,
  status,
  sortable,
  duplicable,
  title,
}: {
  resourceKey: string;
  id: string;
  status?: string;
  sortable: boolean;
  duplicable: boolean;
  title: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      const result = (await fn()) as { error?: string } | undefined;
      if (result?.error) window.alert(result.error);
      router.refresh();
    });

  const iconClass = "size-4";
  const btn = "inline-flex size-8 items-center justify-center text-paper/50 transition-colors hover:text-gold disabled:opacity-40";

  return (
    <div className="flex items-center justify-end gap-0.5">
      {sortable && (
        <>
          <button type="button" disabled={pending} className={btn} aria-label="Subir" onClick={() => run(() => moveResource(resourceKey, id, -1))}>
            <ArrowUp className={iconClass} strokeWidth={1.5} />
          </button>
          <button type="button" disabled={pending} className={btn} aria-label="Bajar" onClick={() => run(() => moveResource(resourceKey, id, 1))}>
            <ArrowDown className={iconClass} strokeWidth={1.5} />
          </button>
        </>
      )}

      {status && (
        <button
          type="button"
          disabled={pending}
          className={btn}
          aria-label={status === "PUBLISHED" ? "Despublicar" : "Publicar"}
          onClick={() => run(() => toggleResourceStatus(resourceKey, id, status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"))}
        >
          {status === "PUBLISHED" ? <Eye className={iconClass} strokeWidth={1.5} /> : <EyeOff className={iconClass} strokeWidth={1.5} />}
        </button>
      )}

      {duplicable && (
        <button type="button" disabled={pending} className={btn} aria-label="Duplicar" onClick={() => run(() => duplicateResource(resourceKey, id))}>
          <Copy className={iconClass} strokeWidth={1.5} />
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        className={`${btn} hover:text-red-300`}
        aria-label="Eliminar"
        onClick={() => {
          if (window.confirm(`¿Eliminar “${title}”? Esta acción no se puede deshacer desde el panel.`)) {
            run(() => deleteResource(resourceKey, id));
          }
        }}
      >
        <Trash2 className={iconClass} strokeWidth={1.5} />
      </button>
    </div>
  );
}
