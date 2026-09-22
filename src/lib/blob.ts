import "server-only";
import { put, del, head } from "@vercel/blob";
import { missingBlobTokenMessage, resolveBlobToken } from "@/lib/blob-token";

/**
 * Dos ámbitos de almacenamiento:
 *  - PUBLIC:  imágenes del sitio (servidas por next/image).
 *  - PRIVATE: comprobantes y documentación. Nunca se publica la URL;
 *             el acceso pasa siempre por /api/private-files/[id] con sesión válida.
 */

export const PRIVATE_PREFIX = "private";

function token() {
  const resolved = resolveBlobToken();
  if (!resolved) throw new Error(missingBlobTokenMessage());
  return resolved.token;
}

export async function putPublic(pathname: string, body: Blob | Buffer | string, contentType?: string) {
  return put(pathname, body, {
    access: "public",
    token: token(),
    contentType,
    addRandomSuffix: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * Sube un archivo privado. Se usa el prefijo `private/` + sufijo aleatorio, y la URL
 * se guarda solo en la base; nunca se entrega al navegador sin autorización previa.
 */
export async function putPrivate(pathname: string, body: Blob | Buffer, contentType?: string) {
  const full = `${PRIVATE_PREFIX}/${pathname.replace(/^\/+/, "")}`;
  return put(full, body, {
    access: "public",
    token: token(),
    contentType,
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
  });
}

export async function deleteBlob(url: string) {
  return del(url, { token: token() });
}

export async function blobHead(url: string) {
  try {
    return await head(url, { token: token() });
  } catch {
    return null;
  }
}

export function isPrivatePathname(pathname: string) {
  return pathname.startsWith(`${PRIVATE_PREFIX}/`);
}
