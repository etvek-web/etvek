import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Único acceso a archivos privados. Exige sesión administrativa válida y
 * proxea el contenido: la URL del blob nunca se entrega al navegador.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const { id } = await params;
  const file = await prisma.privateFile.findUnique({ where: { id } });
  if (!file) return new NextResponse("No encontrado", { status: 404 });

  const upstream = await fetch(file.blobUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new NextResponse("No disponible", { status: 502 });

  await audit(user, "READ_PRIVATE_FILE", "PrivateFile", file.id);

  return new NextResponse(upstream.body, {
    headers: {
      "content-type": file.mimeType,
      "content-disposition": `inline; filename="${file.fileName.replace(/"/g, "")}"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
