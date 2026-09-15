import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

export const revalidate = 3600;

/** Manifiesto para quienes agregan el sitio a la pantalla de inicio del celular. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();

  return {
    name: `${settings.siteName} — ${settings.tagline ?? "Estudio Técnico Vocal"}`,
    short_name: settings.siteName,
    description:
      "Optimizá y rehabilitá tu voz con estándar de élite y respaldo científico. Atención 100% online.",
    start_url: "/",
    display: "standalone",
    background_color: settings.colorBackground,
    theme_color: settings.colorBackground,
    lang: "es-AR",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
