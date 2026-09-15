import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { putPrivate } from "@/lib/blob";
import { verifyReceiptToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/auth";
import { detectMime, matchesDeclared } from "@/lib/magic-bytes";
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE, safeFileName } from "@/lib/media-constraints";

export const runtime = "nodejs";

/**
 * Carga de comprobantes. El archivo se almacena como privado y su URL nunca se devuelve
 * al navegador: sólo /admin puede recuperarlo mediante /api/private-files/[id].
 */
export async function POST(request: Request) {
  const h = await headers();
  const limited = await rateLimit(`receipt:${hashIp(h.get("x-forwarded-for")) ?? "anon"}`, 10, 60 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Demasiados envíos. Probá más tarde." }, { status: 429 });

  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const admissionId = await verifyReceiptToken(token);
  if (!admissionId) return NextResponse.json({ error: "El enlace de carga expiró." }, { status: 401 });

  const admission = await prisma.admissionRequest.findFirst({ where: { id: admissionId, deletedAt: null } });
  if (!admission) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });

  const reference = String(form.get("reference") ?? "").slice(0, 64) || null;
  const file = form.get("file");
  let receiptId: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json({ error: "El archivo supera el tamaño máximo permitido." }, { status: 413 });
    }
    if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido." }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectMime(new Uint8Array(buffer.subarray(0, 512)));
    if (!matchesDeclared(file.type, detected)) {
      return NextResponse.json({ error: "El contenido del archivo no coincide con su formato." }, { status: 415 });
    }

    const blob = await putPrivate(`comprobantes/${admissionId}/${safeFileName(file.name)}`, buffer, file.type);
    const saved = await prisma.privateFile.create({
      data: {
        blobPathname: blob.pathname,
        blobUrl: blob.url,
        fileName: safeFileName(file.name),
        mimeType: file.type,
        size: buffer.byteLength,
      },
    });
    receiptId = saved.id;
  }

  if (!receiptId && !reference) {
    return NextResponse.json({ error: "Adjuntá el comprobante o ingresá el código MTCN." }, { status: 400 });
  }

  await prisma.payment.create({
    data: {
      admissionId,
      programId: admission.programId,
      currency: admission.countryName === "Argentina" ? "ARS" : "USD",
      reference,
      receiptId,
      status: "COMPROBANTE_RECIBIDO",
    },
  });

  await prisma.admissionRequest.update({
    where: { id: admissionId },
    data: { status: "COMPROBANTE_RECIBIDO" },
  });

  return NextResponse.json({ ok: true });
}
