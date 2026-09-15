"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { trackEvent } from "@/lib/track";

/** Widget de agenda (Calendly / SavvyCal) configurable desde /admin, con zona horaria del visitante. */
export function Scheduler({ url, provider }: { url: string; provider: string }) {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setTimezone(null);
    }
  }, []);

  const embedUrl = (() => {
    try {
      const u = new URL(url);
      if (timezone) {
        if (provider === "savvycal") u.searchParams.set("time_zone", timezone);
        else u.searchParams.set("timezone", timezone);
      }
      if (provider === "calendly") {
        u.searchParams.set("background_color", "111111");
        u.searchParams.set("text_color", "ffffff");
        u.searchParams.set("primary_color", "c5a059");
        u.searchParams.set("hide_gdpr_banner", "1");
      }
      return u.toString();
    } catch {
      return url;
    }
  })();

  return (
    <div>
      <div className="overflow-hidden border border-paper/10 bg-ink-800/60">
        <iframe
          src={embedUrl}
          title="Agenda de sesiones"
          loading="lazy"
          className="h-[680px] w-full border-0 sm:h-[760px]"
          onLoad={() => trackEvent("scheduler_opened")}
        />
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-paper/45">
        <CalendarClock className="size-4" strokeWidth={1.5} aria-hidden="true" />
        {timezone ? `Horarios mostrados en tu zona horaria (${timezone}).` : "Los horarios se ajustan a tu zona horaria."}
      </p>
      <div className="mt-6">
        <ButtonLink href={url} variant="outline" size="sm" external>
          Abrir agenda en una pestaña nueva
        </ButtonLink>
      </div>
    </div>
  );
}
