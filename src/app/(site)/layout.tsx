import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { getCountries, getNavigation, getSettings, getSocialLinks } from "@/lib/content";
import { absoluteUrl, whatsappHref } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navigation, socials, countries] = await Promise.all([
    getSettings(),
    getNavigation(),
    getSocialLinks(),
    getCountries(),
  ]);

  const map = (location: string) =>
    navigation
      .filter((n) => n.location === location)
      .map((n) => ({ id: n.id, label: n.label, href: n.href, isExternal: n.isExternal }));

  const wa = settings.whatsappEnabled ? whatsappHref(settings.whatsappNumber, settings.whatsappMessage) : null;

  // JSON-LD sólo con datos verificables del brief: nada de credenciales inventadas.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.siteName,
    description: settings.tagline ?? undefined,
    email: settings.contactEmail,
    url: absoluteUrl("/"),
    availableLanguage: "es",
    areaServed: countries.map((c) => ({ "@type": "Country", name: c.name })),
    provider: { "@type": "Person", name: "Eliana Kestler" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>

      <Header items={map("HEADER")} siteName={settings.siteName} tagline={settings.tagline} />

      <main id="contenido">{children}</main>

      <Footer
        siteName={settings.siteName}
        tagline={settings.tagline}
        contactEmail={settings.contactEmail}
        items={map("FOOTER")}
        legal={map("LEGAL")}
        socials={socials.map((s) => ({ id: s.id, platform: s.platform, url: s.url, handle: s.handle }))}
        countries={countries.map((c) => c.name)}
      />

      {wa && <WhatsAppFab href={wa} label={settings.whatsappMessage} />}
      {settings.analyticsEnabled && <Analytics />}
    </>
  );
}
