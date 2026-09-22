import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import {
  DIRECT_UPLOAD_MIME_TYPES,
  MAX_INPUT_SIZE,
  MAX_MODEL_SIZE,
  MAX_OPTIMIZED_IMAGE_SIZE,
  MODEL_MIME_TYPES,
  VIDEO_MIME_TYPES,
  isSafePathname,
} from "@/lib/media-constraints";

export const runtime = "nodejs";

/**
 * Autoriza uploads directos navegador → Vercel Blob.
 * El archivo grande nunca atraviesa una Function: acá sólo se valida sesión,
 * tipo, tamaño y se genera un pathname seguro.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? (JSON.parse(clientPayload) as { folder?: string; kind?: string }) : {};
        const isVideo = payload.kind === "video";
        const isModel = payload.kind === "model";

        // El pathname lo fija el cliente y esta API no permite reescribirlo, así que
        // se valida y se rechaza el upload si no tiene la forma esperada.
        if (!isSafePathname(pathname)) {
          throw new Error("Ruta de archivo no permitida.");
        }

        const allowedContentTypes = isModel
          ? [...MODEL_MIME_TYPES]
          : isVideo
            ? [...VIDEO_MIME_TYPES]
            : [...DIRECT_UPLOAD_MIME_TYPES];

        return {
          allowedContentTypes,
          maximumSizeInBytes: isModel
            ? MAX_MODEL_SIZE
            : isVideo
              ? MAX_INPUT_SIZE * 2
              : Math.max(MAX_OPTIMIZED_IMAGE_SIZE, 1024 * 1024),
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        // El registro en base lo hace la server action `registerMedia` con la metadata
        // calculada en el cliente (dimensiones, hash, peso original).
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
