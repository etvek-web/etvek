import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "@/components/admin/setup-form";
import { AcousticWave } from "@/components/site/acoustic-wave";

export const dynamic = "force-dynamic";
export const metadata = { title: "Primer acceso — Panel ETVEK", robots: { index: false, follow: false } };

/** Disponible únicamente mientras no existe ninguna cuenta. Después redirige al login. */
export default async function SetupPage() {
  if ((await prisma.user.count()) > 0) redirect("/admin/login");

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center px-5 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 opacity-20">
        <AcousticWave />
      </div>

      <div className="w-full max-w-sm">
        <p className="font-display text-3xl tracking-[0.3em] text-paper">ETVEK</p>
        <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-paper/40">Primer acceso</p>

        <p className="mt-6 text-sm leading-relaxed text-paper/60">
          Todavía no hay ninguna cuenta en el panel. Creá la tuya para empezar a administrar el sitio.
        </p>

        <div className="mt-6 border border-paper/10 bg-ink-800/60 p-6">
          <SetupForm />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-paper/35">
          Esta pantalla se cierra de forma permanente en cuanto exista la primera cuenta. No es un
          registro público.
        </p>
      </div>
    </main>
  );
}
