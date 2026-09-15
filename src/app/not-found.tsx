import Link from "next/link";
import { AcousticWave } from "@/components/site/acoustic-wave";

export const metadata = { title: "Esta nota está fuera de rango" };

/** 404 con el concepto del brief: señal perdida, nota fuera de rango. */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh items-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-48 -translate-y-1/2 opacity-30">
        <AcousticWave />
      </div>

      <div className="container-etvek py-24 text-center">
        <p className="eyebrow mb-6">Error 404 · Señal perdida</p>
        <h1 className="mx-auto max-w-3xl text-balance font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Esta nota está fuera de rango.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-paper/60">La página que buscás no existe.</p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-13 items-center justify-center rounded-xs bg-clinic px-8 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-colors hover:bg-clinic-light"
          >
            Volver al inicio
          </Link>
          <Link
            href="/contacto"
            className="inline-flex h-13 items-center justify-center rounded-xs border border-paper/25 px-8 text-sm font-medium uppercase tracking-[0.12em] text-paper transition-colors hover:border-gold hover:text-gold"
          >
            Solicitar Evaluación Vocal
          </Link>
        </div>
      </div>
    </main>
  );
}
