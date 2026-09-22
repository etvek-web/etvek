/** Reglas de archivos compartidas entre cliente y servidor. Sin dependencias de Node. */

export const MAX_INPUT_SIZE = 25 * 1024 * 1024; // 25 MB antes de optimizar
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_OPTIMIZED_IMAGE_SIZE = 4 * 1024 * 1024; // red de seguridad post-compresión
export const MAX_SVG_SIZE = 512 * 1024;
export const MAX_MODEL_SIZE = 24 * 1024 * 1024;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

/**
 * Tipos permitidos en el upload directo navegador → Blob.
 * El SVG queda deliberadamente afuera: se sube por server action para poder
 * sanearlo antes de almacenarlo (lib/svg-sanitize).
 */
export const DIRECT_UPLOAD_MIME_TYPES = IMAGE_MIME_TYPES.filter((m) => m !== "image/svg+xml");

export const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

/** Modelos 3D para el hero. Sólo glTF binario: un archivo, sin dependencias sueltas. */
export const MODEL_MIME_TYPES = ["model/gltf-binary", "application/octet-stream"] as const;

export type MediaPreset = "hero" | "general" | "thumbnail" | "avatar";

export const PRESETS: Record<MediaPreset, { maxEdge: number; quality: number; targetBytes: number; label: string }> = {
  hero: { maxEdge: 2400, quality: 0.82, targetBytes: 1024 * 1024, label: "Hero (máx. 2400px, objetivo < 1 MB)" },
  general: { maxEdge: 2000, quality: 0.82, targetBytes: 500 * 1024, label: "General (máx. 2000px, objetivo < 500 KB)" },
  thumbnail: { maxEdge: 800, quality: 0.8, targetBytes: 180 * 1024, label: "Miniatura (máx. 800px)" },
  avatar: { maxEdge: 600, quality: 0.82, targetBytes: 140 * 1024, label: "Retrato (máx. 600px)" },
};

/** Formatos que NO se convierten a WebP con pérdida (transparencia / vectores). */
export function keepsOriginalFormat(mime: string) {
  return mime === "image/svg+xml" || mime === "image/gif";
}

export function isAllowedImage(mime: string) {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function isAllowedDocument(mime: string) {
  return (DOCUMENT_MIME_TYPES as readonly string[]).includes(mime);
}

export function isAllowedVideo(mime: string) {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

/** Nombre de archivo seguro: sin rutas, sin caracteres raros, con largo acotado. */
export function safeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "archivo";
  const cleaned = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[-.]+/, "")
    .slice(0, 100);
  return cleaned || "archivo";
}

/** Pathname determinista y seguro dentro del bucket. */
export function buildPathname(folder: string, fileName: string) {
  const clean = safeFileName(fileName);
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "media";
  const stamp = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `${safeFolder}/${stamp}/${clean}`;
}

/**
 * Valida el pathname que propone el cliente para un upload directo.
 * `handleUpload` no permite reescribirlo desde el servidor, así que la única
 * defensa real es rechazar lo que no tenga la forma `carpeta/AAAA-MM/archivo.ext`.
 */
export function isSafePathname(pathname: string) {
  if (pathname.length > 200) return false;
  if (pathname.includes("..") || pathname.startsWith("/")) return false;
  return /^[a-z0-9_-]+\/\d{4}-\d{2}\/[a-zA-Z0-9._-]+$/.test(pathname);
}

export function isAllowedModel(mime: string, fileName: string) {
  if (!fileName.toLowerCase().endsWith(".glb")) return false;
  return (MODEL_MIME_TYPES as readonly string[]).includes(mime) || mime === "";
}
