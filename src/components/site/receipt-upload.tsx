"use client";

import { useRef, useState } from "react";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE } from "@/lib/media-constraints";
import { formatBytes } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "done" } | { kind: "error"; message: string };

/** Carga de comprobante / MTCN. El archivo va a almacenamiento privado, nunca a una URL pública. */
export function ReceiptUpload({ token }: { token: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [reference, setReference] = useState("");

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file && !reference.trim()) {
      setStatus({ kind: "error", message: "Adjuntá el comprobante o ingresá el código MTCN." });
      return;
    }
    if (file) {
      if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
        setStatus({ kind: "error", message: "Formato no permitido. Usá PDF, JPG, PNG o WebP." });
        return;
      }
      if (file.size > MAX_DOCUMENT_SIZE) {
        setStatus({
          kind: "error",
          message: `El archivo pesa ${formatBytes(file.size)}. El máximo es ${formatBytes(MAX_DOCUMENT_SIZE)}.`,
        });
        return;
      }
    }

    setStatus({ kind: "uploading" });
    const body = new FormData();
    body.set("token", token);
    if (file) body.set("file", file);
    if (reference.trim()) body.set("reference", reference.trim());

    try {
      const res = await fetch("/api/receipts", { method: "POST", body });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ kind: "error", message: data.error ?? "No pudimos registrar el comprobante." });
        return;
      }
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: "Error de conexión. Intentá nuevamente." });
    }
  }

  if (status.kind === "done") {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm text-gold">
        <FileCheck2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Comprobante recibido. Eliana lo va a verificar y te confirma la sesión.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <Label htmlFor="receipt-file">Comprobante (PDF o imagen)</Label>
        <Input
          id="receipt-file"
          ref={fileRef}
          type="file"
          accept={DOCUMENT_MIME_TYPES.join(",")}
          className="file:mr-3 file:border-0 file:bg-clinic file:px-3 file:py-1.5 file:text-xs file:text-paper"
        />
      </div>

      <div>
        <Label htmlFor="receipt-reference">Código MTCN o referencia</Label>
        <Input
          id="receipt-reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          maxLength={64}
          placeholder="Opcional si adjuntás el comprobante"
        />
      </div>

      {status.kind === "error" && <p className="text-xs text-red-300">{status.message}</p>}

      <Button type="button" variant="outline" size="sm" onClick={upload} disabled={status.kind === "uploading"}>
        {status.kind === "uploading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" strokeWidth={1.5} aria-hidden="true" />
        )}
        {status.kind === "uploading" ? "Enviando…" : "Enviar comprobante"}
      </Button>
    </div>
  );
}
