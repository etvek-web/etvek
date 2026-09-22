"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Boxes, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { MAX_MODEL_SIZE, buildPathname, isAllowedModel } from "@/lib/media-constraints";
import { formatBytes } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

/**
 * Carga del modelo 3D del hero. Va directo del navegador a Blob, sin pasar por
 * una Function, porque un .glb puede pesar varios MB.
 */
export function ModelUploader({ name, defaultValue }: { name: string; defaultValue: string | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleFile(file: File) {
    if (!isAllowedModel(file.type, file.name)) {
      setStatus({ kind: "error", message: "El archivo debe ser un .glb (glTF binario)." });
      return;
    }
    if (file.size > MAX_MODEL_SIZE) {
      setStatus({
        kind: "error",
        message: `El modelo pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(MAX_MODEL_SIZE)}.`,
      });
      return;
    }

    setStatus({ kind: "uploading" });
    try {
      const blob = await upload(buildPathname("modelos", file.name), file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
        contentType: "model/gltf-binary",
        clientPayload: JSON.stringify({ folder: "modelos", kind: "model" }),
      });
      setUrl(blob.url);
      setStatus({ kind: "idle" });
    } catch (error) {
      setStatus({ kind: "error", message: (error as Error).message || "No se pudo subir el modelo." });
    }
  }

  return (
    <div>
      <Label htmlFor="hero-model-url">Modelo 3D del hero (.glb)</Label>
      <Input
        id="hero-model-url"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Vacío = laringe dibujada por código"
      />

      <input
        ref={fileRef}
        type="file"
        accept=".glb,model/gltf-binary"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={status.kind === "uploading"}
        >
          {status.kind === "uploading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Boxes className="size-4" strokeWidth={1.5} aria-hidden="true" />
          )}
          {status.kind === "uploading" ? "Subiendo…" : "Subir archivo .glb"}
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}>
            Quitar
          </Button>
        )}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-paper/45">
        Si cargás un modelo, reemplaza a la laringe dibujada por código. Máximo {formatBytes(MAX_MODEL_SIZE)}.
        Recordá completar el crédito si la licencia lo exige.
      </p>

      {status.kind === "error" && <p className="mt-2 text-xs text-red-300">{status.message}</p>}
    </div>
  );
}
