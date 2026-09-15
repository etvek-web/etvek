"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  CreditCard,
  FileText,
  Globe2,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Search,
  Settings,
  Sparkles,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

const GROUPS: { title: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Sitio",
    items: [
      { href: "/admin/sitio/home", label: "Inicio", icon: FileText },
      { href: "/admin/sitio/sobre-eliana", label: "Sobre Eliana", icon: FileText },
      { href: "/admin/sitio/modalidad-online", label: "Modalidad Online", icon: FileText },
      { href: "/admin/sitio/contacto", label: "Contacto", icon: FileText },
    ],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/programas", label: "Programas", icon: Sparkles },
      { href: "/admin/credenciales", label: "Credenciales", icon: Sparkles },
      { href: "/admin/trayectoria", label: "Trayectoria", icon: CalendarClock },
      { href: "/admin/testimonios", label: "Testimonios", icon: Sparkles },
      { href: "/admin/casos-exito", label: "Casos de éxito", icon: Sparkles },
      { href: "/admin/paises", label: "Países", icon: Globe2 },
    ],
  },
  { title: "Multimedia", items: [{ href: "/admin/media", label: "Biblioteca de medios", icon: ImageIcon }] },
  {
    title: "Admisión",
    items: [
      { href: "/admin/admisiones", label: "Solicitudes", icon: Inbox },
      { href: "/admin/pagos", label: "Pagos y comprobantes", icon: CreditCard },
      { href: "/admin/metodos-pago", label: "Métodos de pago", icon: CreditCard },
    ],
  },
  {
    title: "Configuración",
    items: [
      { href: "/admin/agenda", label: "Agenda", icon: CalendarClock },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/navegacion", label: "Navegación", icon: Globe2 },
      { href: "/admin/redes", label: "Redes sociales", icon: Globe2 },
      { href: "/admin/apariencia", label: "Apariencia", icon: Palette },
      { href: "/admin/configuracion", label: "Configuración", icon: Settings },
      { href: "/admin/cuenta", label: "Cuenta", icon: UserCog },
    ],
  },
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Panel" className="space-y-7 py-6">
      {GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <p className="mb-2.5 px-5 text-[0.6rem] uppercase tracking-[0.2em] text-paper/35">{group.title}</p>
          )}
          <ul>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                      active ? "bg-clinic/15 text-gold" : "text-paper/60 hover:bg-paper/5 hover:text-paper",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-ink">
      <aside className="hidden w-64 shrink-0 border-r border-paper/10 bg-ink-800 lg:block">
        <div className="sticky top-0 max-h-dvh overflow-y-auto">
          <div className="border-b border-paper/10 px-5 py-5">
            <Link href="/admin" className="font-display text-xl tracking-[0.3em] text-paper">
              ETVEK
            </Link>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-paper/35">Panel</p>
          </div>
          {nav}
          <div className="border-t border-paper/10 p-5">
            <p className="text-xs text-paper/50">{userName}</p>
            <form action={logout}>
              <button type="submit" className="mt-2 inline-flex items-center gap-2 text-xs text-paper/60 hover:text-gold">
                <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b border-paper/10 bg-ink/95 px-4 py-3 backdrop-blur lg:hidden"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
        >
          <Link href="/admin" className="font-display text-lg tracking-[0.28em]">
            ETVEK
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex size-10 items-center justify-center text-paper"
          >
            {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
          </button>
        </header>

        <div id="admin-nav" hidden={!open} className="border-b border-paper/10 bg-ink-800 lg:hidden">
          {nav}
          <div className="border-t border-paper/10 p-5">
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-2 text-xs text-paper/60">
                <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
