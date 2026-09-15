"use client";

import { PRESETS, keepsOriginalFormat, type MediaPreset } from "@/lib/media-constraints";

export type OptimizedImage = {
  file: File;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  size: number;
  mimeType: string;
  previewUrl: string;
  hash: string;
  converted: boolean;
};

async function sha256Hex(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function replaceExtension(name: string, ext: string) {
  return `${name.replace(/\.[a-z0-9]+$/i, "")}.${ext}`;
}

async function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo codificar la imagen."))), type, quality);
  });
}

/**
 * Optimiza una imagen en el navegador antes de subirla a Vercel Blob:
 * corrige orientación EXIF, redimensiona, comprime con calidad adaptativa,
 * convierte a WebP cuando corresponde y descarta la metadata EXIF al recodificar.
 * Los formatos vectoriales o animados (SVG, GIF) se preservan tal cual.
 */
export async function optimizeImage(file: File, preset: MediaPreset = "general"): Promise<OptimizedImage> {
  const originalBuffer = await file.arrayBuffer();
  const hashSource = await sha256Hex(originalBuffer);

  if (keepsOriginalFormat(file.type)) {
    return {
      file,
      width: 0,
      height: 0,
      originalWidth: 0,
      originalHeight: 0,
      originalSize: file.size,
      size: file.size,
      mimeType: file.type,
      previewUrl: URL.createObjectURL(file),
      hash: hashSource,
      converted: false,
    };
  }

  // `imageOrientation: "from-image"` aplica la rotación EXIF; el re-encode elimina el resto de la metadata.
  const bitmap = await createImageBitmap(new Blob([originalBuffer], { type: file.type }), {
    imageOrientation: "from-image",
  });

  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const { maxEdge, quality, targetBytes } = PRESETS[preset];
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no permite procesar la imagen.");
  ctx.imageSmoothingQuality = "high";

  // El PNG con transparencia se conserva como PNG para no ensuciar el fondo.
  const hasAlpha = file.type === "image/png";
  if (!hasAlpha) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = "image/webp";
  let currentQuality = quality;
  let blob = await encode(canvas, outputType, currentQuality);

  // Compresión adaptativa: bajamos calidad por pasos sólo mientras el peso lo justifique.
  while (blob.size > targetBytes && currentQuality > 0.62) {
    currentQuality = Math.round((currentQuality - 0.06) * 100) / 100;
    blob = await encode(canvas, outputType, currentQuality);
  }

  // Si la "optimización" no mejora nada (imágenes ya muy comprimidas), conservamos la original.
  const useOptimized = blob.size < file.size * 0.95 || scale < 1;
  const finalBlob = useOptimized ? blob : new Blob([originalBuffer], { type: file.type });
  const finalType = useOptimized ? outputType : file.type;
  const finalName = useOptimized ? replaceExtension(file.name, "webp") : file.name;
  const finalBuffer = await finalBlob.arrayBuffer();

  return {
    file: new File([finalBuffer], finalName, { type: finalType }),
    width,
    height,
    originalWidth,
    originalHeight,
    originalSize: file.size,
    size: finalBlob.size,
    mimeType: finalType,
    previewUrl: URL.createObjectURL(finalBlob),
    hash: await sha256Hex(finalBuffer),
    converted: useOptimized,
  };
}
