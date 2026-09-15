import { AcousticWave } from "@/components/site/acoustic-wave";

/** Pantalla de mantenimiento. Se activa desde /admin → Configuración. */
export function MaintenanceScreen({ siteName, contactEmail }: { siteName: string; contactEmail: string }) {
  return (
    <main className="relative isolate flex min-h-dvh items-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 opacity-25">
        <AcousticWave />
      </div>

      <div className="container-etvek py-24 text-center">
        <p className="font-display text-3xl tracking-[0.3em] text-paper">{siteName}</p>
        <h1 className="mx-auto mt-8 max-w-2xl text-balance font-display text-3xl leading-tight sm:text-4xl">
          Estamos afinando el instrumento.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-paper/60">
          El sitio vuelve en breve. Mientras tanto, podés escribirnos.
        </p>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-8 inline-flex h-12 items-center border border-paper/25 px-7 text-sm uppercase tracking-[0.12em] text-paper transition-colors hover:border-gold hover:text-gold"
        >
          {contactEmail}
        </a>
      </div>
    </main>
  );
}
