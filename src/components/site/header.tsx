"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string; href: string; isExternal: boolean };

export function Header({ items, siteName, tagline }: { items: NavItem[]; siteName: string; tagline?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-ink/95 backdrop-blur-md hairline" : "bg-transparent",
      )}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="container-etvek flex h-18 items-center justify-between py-4">
        <Link href="/" className="group flex flex-col leading-none" aria-label={`${siteName} — Inicio`}>
          <span className="font-display text-2xl tracking-[0.3em] text-paper transition-colors group-hover:text-gold">
            {siteName}
          </span>
          {tagline && (
            <span className="mt-1 hidden text-[0.6rem] uppercase tracking-[0.2em] text-paper/45 sm:block">
              {tagline}
            </span>
          )}
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[0.7rem] uppercase tracking-[0.18em] transition-colors",
                  active ? "text-gold" : "text-paper/65 hover:text-paper",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex size-10 items-center justify-center text-paper lg:hidden"
        >
          {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>
      </div>

      <div
        id="menu-movil"
        hidden={!open}
        className="hairline h-[calc(100dvh-4.5rem)] overflow-y-auto bg-ink lg:hidden"
      >
        <nav aria-label="Navegación móvil" className="container-etvek flex flex-col py-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noopener noreferrer" : undefined}
              className="border-b border-paper/8 py-4 font-display text-2xl text-paper/85 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
