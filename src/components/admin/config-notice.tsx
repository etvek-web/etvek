import { AlertTriangle } from "lucide-react";
import type { ConfigIssue } from "@/lib/config-check";

/** Pantalla de configuración incompleta, en lugar de un 500 sin explicación. */
export function ConfigNotice({ issues }: { issues: ConfigIssue[] }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">
        <p className="font-display text-3xl tracking-[0.3em] text-paper">ETVEK</p>
        <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-paper/40">Configuración incompleta</p>

        <div className="mt-8 border border-gold/30 bg-ink-800/60 p-6">
          <AlertTriangle className="size-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-4 text-xl text-paper">Falta configurar el entorno</h1>
          <p className="mt-2 text-sm leading-relaxed text-paper/60">
            El panel no puede iniciar sesión hasta que estas variables estén cargadas. El sitio público no se
            ve afectado.
          </p>

          <ul className="mt-6 space-y-5">
            {issues.map((issue) => (
              <li key={issue.variable} className="border-l-2 border-clinic pl-4">
                <p className="font-mono text-sm text-paper">{issue.variable}</p>
                <p className="mt-1 text-sm text-paper/70">{issue.problem}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-paper/45">{issue.fix}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-paper/10 pt-4 text-xs leading-relaxed text-paper/40">
            Después de cargarlas hay que volver a desplegar: las variables nuevas no entran en un deploy ya
            iniciado.
          </p>
        </div>
      </div>
    </main>
  );
}
