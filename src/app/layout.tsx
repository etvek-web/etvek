import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ETVEK — Estudio Técnico Vocal de Eliana Kestler", template: "%s | ETVEK" },
  description:
    "Optimizá y rehabilitá tu voz con estándar de élite y respaldo científico. Alto rendimiento vocal, fonoaudiología y rehabilitación vocal, 100% online.",
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-ink text-paper antialiased">{children}</body>
    </html>
  );
}
