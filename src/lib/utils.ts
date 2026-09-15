import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function savingsPercent(original: number, optimized: number) {
  if (!original || original <= optimized) return 0;
  return Math.round(((original - optimized) / original) * 1000) / 10;
}

export function formatPrice(amount: number, currency: "ARS" | "USD") {
  return new Intl.NumberFormat(currency === "ARS" ? "es-AR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", opts ?? { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export const DEFAULT_PROGRAM_MESSAGE = "Hola Eliana, me interesa el programa de {programa}.";

/**
 * Reemplaza {programa} en la plantilla del mensaje de WhatsApp.
 * Tolera una plantilla ausente: el valor viene de la base y puede faltar en una
 * entrada de caché anterior a que la columna existiera.
 */
export function programMessage(template: string | null | undefined, programName: string) {
  const source = template?.trim() || DEFAULT_PROGRAM_MESSAGE;
  return source.includes("{programa}")
    ? source.replaceAll("{programa}", programName)
    : `${source} ${programName}`.trim();
}

/** Construye el href de WhatsApp con mensaje contextual. */
export function whatsappHref(number: string | null | undefined, message: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Lee una variable de entorno tratando la cadena vacía como ausente. */
function env(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

/**
 * URL absoluta del sitio. La base se resuelve por prioridad y tolera variables
 * definidas pero vacías, que es como quedan al crearlas sin valor en Vercel.
 * Si falta el protocolo se asume https.
 */
export function absoluteUrl(path = "/") {
  const configured = env("NEXT_PUBLIC_SITE_URL");
  const production = env("VERCEL_PROJECT_PRODUCTION_URL");
  const deployment = env("VERCEL_URL");

  const candidates = [
    configured,
    production ? `https://${production}` : null,
    deployment ? `https://${deployment}` : null,
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
    try {
      return new URL(path, withProtocol).toString();
    } catch {
      // Valor mal formado: probamos el siguiente candidato.
    }
  }

  // Inalcanzable en la práctica: el último candidato es una base válida.
  return path;
}
