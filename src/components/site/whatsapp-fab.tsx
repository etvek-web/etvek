"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/track";

type ProgramLink = { slug: string; href: string };

function Fab({ href, label, programLinks }: { href: string; label: string; programLinks: ProgramLink[] }) {
  const [visible, setVisible] = useState(false);
  const params = useSearchParams();

  // Si la visita llega desde un programa concreto, el mensaje lo menciona.
  const slug = params.get("programa");
  const contextual = slug ? programLinks.find((p) => p.slug === slug) : undefined;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={contextual?.href ?? href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={() => trackEvent("whatsapp_click")}
      className={`fixed right-5 z-40 inline-flex items-center gap-2.5 rounded-xs bg-clinic px-4 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-paper shadow-lg shadow-black/40 transition-all duration-300 hover:bg-clinic-light ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px))` }}
    >
      <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

/**
 * Botón flotante de WhatsApp (abajo a la derecha, según el brief).
 * El mensaje se contextualiza con el programa desde el que llega la visita.
 */
export function WhatsAppFab(props: { href: string; label: string; programLinks?: ProgramLink[] }) {
  return (
    <Suspense fallback={null}>
      <Fab href={props.href} label={props.label} programLinks={props.programLinks ?? []} />
    </Suspense>
  );
}
