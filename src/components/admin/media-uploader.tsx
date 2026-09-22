"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImageUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { optimizeImage, type OptimizedImage } from "@/lib/image-optimize";
import { registerMedia } from "@/app/actions/media";
import { MAX_INPUT_SIZE, PRESETS, buildPathname, isAllowedImage, type MediaPreset } from "@/lib/media-constraints";
import { formatBytes, savingsPercent } from "@/lib/utils";


/** La librería de Blob oculta la causa: preguntamos antes para poder explicarla. */
async function blobPreflight(): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/blob-upload", { method: "GET" });
    const data = (await res.json()) as { ready?: boolean; reason?: string };
    return data.ready ? null : (data.reason ?? "El almacenamiento de archivos no está disponible.");
  } catch {
    return null; // Si el preflight falla, dejamos que lo intente igual.
  }
}

type Phase =
  | { kind: "idle" }
  | { kind: "optimizing" }
  | { kind: "ready"; result: OptimizedImage }
  | { kind: "uploading" }
  | { kind: "error"; message: string };

/**
 * Pipeline completo de carga: validar → leer dimensiones → corregir orientación →
 * quitar EXIF → redimensionar → comprimir → previsualizar pesos → subir a Vercel Blob.
 * El archivo original grande nunca se sube: sólo viaja la versión optimizada.
 */
export function MediaUploader({
  folder = "media",
  onUploaded,
  compact = false,
}: {
  folder?: string;
  onUploaded?: (mediaId: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [preset, setPreset] = useState<MediaPreset>("general");
  const [alt, setAlt] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isAllowedImage(file.type)) {
        setPhase({ kind: "error", message: "Formato no permitido. Usá JPG, PNG, WebP, AVIF, GIF o SVG." });
        return;
      }
      if (file.size > MAX_INPUT_SIZE) {
        setPhase({
          kind: "error",
          message: `La imagen pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(MAX_INPUT_SIZE)}. Reducila antes de subirla.`,
        });
        return;
      }

      setPhase({ kind: "optimizing" });
      try {
        const result = await optimizeImage(file, preset);
        setAlt((prev) => prev || file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "));
        setPhase({ kind: "ready", result });
      } catch (error) {
        setPhase({ kind: "error", message: (error as Error).message });
      }
    },
    [preset],
  );

  async function doUpload() {
    if (phase.kind !== "ready") return;
    const { result } = phase;
    setPhase({ kind: "uploading" });

    const blocked = await blobPreflight();
    if (blocked) {
      setPhase({ kind: "error", message: blocked });
      return;
    }

    try {
      const blob = await upload(buildPathname(folder, result.file.name), result.file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
        contentType: result.mimeType,
        clientPayload: JSON.stringify({ folder, kind: "image" }),
      });

      const saved = await registerMedia({
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        fileName: result.file.name,
        mimeType: result.mimeType,
        width: result.width || null,
        height: result.height || null,
        size: result.size,
        originalSize: result.originalSize,
        hash: result.hash,
        alt,
        folder,
      });

      setPhase({ kind: "idle" });
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(saved.id);
    } catch (error) {
      setPhase({ kind: "error", message: (error as Error).message || "No se pudo subir la imagen." });
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
      className={`rounded-xs border border-dashed p-6 transition-colors ${
        dragging ? "border-gold bg-gold/5" : "border-paper/20 bg-ink-700/30"
      }`}
    >
      {phase.kind === "ready" ? (
        <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden border border-paper/10 bg-ink">
            {/* Preview local: no pasa por next/image porque es un blob: URL temporal. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={phase.result.previewUrl} alt="Vista previa" className="size-full object-cover" />
          </div>

          <div className="space-y-4">
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-4 text-paper/50">
                <dt>Original</dt>
                <dd className="tabular-nums">
                  {phase.result.originalWidth}×{phase.result.originalHeight} · {formatBytes(phase.result.originalSize)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-paper/80">
                <dt>Optimizada</dt>
                <dd className="tabular-nums">
                  {phase.result.width}×{phase.result.height} · {formatBytes(phase.result.size)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-gold">
                <dt>Ahorro</dt>
                <dd className="tabular-nums">{savingsPercent(phase.result.originalSize, phase.result.size)}%</dd>
              </div>
            </dl>

            <div>
              <Label htmlFor="media-alt">Texto alternativo</Label>
              <Input
                id="media-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                maxLength={300}
                placeholder="Describí la imagen para lectores de pantalla"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={doUpload}>
                Subir imagen
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  URL.revokeObjectURL(phase.result.previewUrl);
                  setPhase({ kind: "idle" });
                }}
              >
                <X className="size-4" strokeWidth={1.5} /> Descartar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <ImageUp className="mx-auto size-7 text-paper/40" strokeWidth={1.25} aria-hidden="true" />
          <p className="mt-3 text-sm text-paper/70">Arrastrá una imagen o seleccioná un archivo</p>
          <p className="mt-1 text-xs text-paper/40">
            Se optimiza automáticamente antes de subirse. Máximo de entrada: {formatBytes(MAX_INPUT_SIZE)}.
          </p>

          {!compact && (
            <div className="mx-auto mt-4 max-w-xs text-left">
              <Label htmlFor="media-preset">Destino</Label>
              <Select id="media-preset" value={preset} onChange={(e) => setPreset(e.target.value as MediaPreset)}>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <input
            ref={inputRef}
            id="media-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={phase.kind === "optimizing" || phase.kind === "uploading"}
            >
              {(phase.kind === "optimizing" || phase.kind === "uploading") && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {phase.kind === "optimizing"
                ? "Optimizando…"
                : phase.kind === "uploading"
                  ? "Subiendo…"
                  : "Seleccionar archivo"}
            </Button>
          </div>

          {phase.kind === "error" && <p className="mt-4 text-xs text-red-300">{phase.message}</p>}
        </div>
      )}
    </div>
  );
}
