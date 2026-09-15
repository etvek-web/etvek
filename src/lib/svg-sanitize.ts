/**
 * Saneamiento mínimo de SVG: elimina scripts, handlers y referencias externas.
 * Si el archivo sigue conteniendo patrones peligrosos, se rechaza.
 */
const DANGEROUS = /<\s*(script|foreignObject|iframe|embed|object|use\s[^>]*xlink:href\s*=\s*["']https?:)/i;

export function sanitizeSvg(source: string): { ok: true; svg: string } | { ok: false; reason: string } {
  let svg = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "")
    .replace(/<\s*(foreignObject|iframe|embed|object)[\s\S]*?<\s*\/\s*\1\s*>/gi, "");

  svg = svg.trim();
  if (!/^<\?xml|^<svg/i.test(svg)) return { ok: false, reason: "El archivo no parece un SVG válido." };
  if (DANGEROUS.test(svg)) return { ok: false, reason: "El SVG contiene elementos no permitidos." };
  return { ok: true, svg };
}
