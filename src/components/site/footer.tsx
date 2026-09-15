import Link from "next/link";

type Item = { id: string; label: string; href: string; isExternal: boolean };
type Social = { id: string; platform: string; url: string; handle: string | null };

export function Footer({
  siteName,
  tagline,
  contactEmail,
  items,
  legal,
  socials,
  countries,
}: {
  siteName: string;
  tagline?: string | null;
  contactEmail: string;
  items: Item[];
  legal: Item[];
  socials: Social[];
  countries: string[];
}) {
  return (
    <footer className="hairline mt-24 bg-ink-800">
      <div className="container-etvek grid gap-12 py-16 md:grid-cols-4 md:py-20">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.3em] text-paper">{siteName}</p>
          {tagline && <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/55">{tagline}</p>}
          <a
            href={`mailto:${contactEmail}`}
            className="mt-6 inline-block text-sm text-paper/70 underline-offset-4 hover:text-gold hover:underline"
          >
            {contactEmail}
          </a>
          {countries.length > 0 && (
            <p className="mt-6 text-xs leading-relaxed text-paper/40">
              Atención online en {countries.join(" · ")}.
            </p>
          )}
        </div>

        <nav aria-label="Secciones">
          <p className="eyebrow mb-5">Secciones</p>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-sm text-paper/60 transition-colors hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5">Legales</p>
          <ul className="space-y-3">
            {legal.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-sm text-paper/60 transition-colors hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {socials.length > 0 && (
            <>
              <p className="eyebrow mb-4 mt-8">Redes</p>
              <ul className="space-y-3">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-paper/60 transition-colors hover:text-paper"
                    >
                      {s.handle ?? s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="hairline">
        <div className="container-etvek flex flex-col gap-2 py-6 text-xs text-paper/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
          </p>
          <p>Estudio Técnico Vocal de Eliana Kestler</p>
        </div>
      </div>
    </footer>
  );
}
