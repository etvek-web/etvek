/** Verificación de firma binaria: no confiamos en el MIME declarado por el navegador. */
const SIGNATURES: { mime: string; check: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    check: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  { mime: "image/gif", check: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  {
    mime: "image/avif",
    check: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
  },
  { mime: "application/pdf", check: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
];

export function detectMime(bytes: Uint8Array): string | null {
  for (const sig of SIGNATURES) {
    if (sig.check(bytes)) return sig.mime;
  }
  const head = new TextDecoder().decode(bytes.slice(0, 256)).trimStart();
  if (head.startsWith("<?xml") || head.startsWith("<svg")) return "image/svg+xml";
  return null;
}

/** Acepta el archivo sólo si su firma coincide con el tipo declarado (con equivalencias razonables). */
export function matchesDeclared(declared: string, detected: string | null) {
  if (!detected) return false;
  if (declared === detected) return true;
  if (declared === "image/jpg" && detected === "image/jpeg") return true;
  return false;
}
