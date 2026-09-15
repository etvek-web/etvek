"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type PaymentMethodData = {
  id: string;
  name: string;
  currency: "ARS" | "USD";
  instructions: string | null;
  holder: string | null;
  bank: string | null;
  cbu: string | null;
  alias: string | null;
  accountInfo: string | null;
};

const LABELS: Record<"ARS" | "USD", string> = {
  ARS: "Argentina · ARS",
  USD: "Exterior · USD",
};

/** Selector de moneda con los datos de depósito cargados desde /admin. */
export function PaymentInfo({ methods, whatsappHref }: { methods: PaymentMethodData[]; whatsappHref: string | null }) {
  const currencies = Array.from(new Set(methods.map((m) => m.currency)));
  const [currency, setCurrency] = useState<"ARS" | "USD">(currencies[0] ?? "ARS");
  if (methods.length === 0) return null;
  const visible = methods.filter((m) => m.currency === currency);

  return (
    <div>
      <div role="tablist" aria-label="Moneda de pago" className="inline-flex border border-paper/15">
        {currencies.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={currency === c}
            onClick={() => setCurrency(c)}
            className={cn(
              "px-5 py-3 text-[0.7rem] uppercase tracking-[0.16em] transition-colors",
              currency === c ? "bg-clinic text-paper" : "text-paper/60 hover:text-paper",
            )}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visible.map((m) => {
          const rows = [
            ["Titular", m.holder],
            ["Banco", m.bank],
            ["CBU / CVU", m.cbu],
            ["Alias", m.alias],
            ["Datos adicionales", m.accountInfo],
          ].filter(([, value]) => Boolean(value)) as [string, string][];

          return (
            <div key={m.id} className="border border-paper/10 bg-ink-800/60 p-7">
              <h3 className="text-xl text-paper">{m.name}</h3>
              {m.instructions && <p className="mt-3 text-sm leading-relaxed text-paper/60">{m.instructions}</p>}

              {rows.length > 0 ? (
                <dl className="mt-6 space-y-3">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5 border-b border-paper/8 pb-3 last:border-0">
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-paper/40">{label}</dt>
                      <dd className="text-sm break-words text-paper/85">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-6 text-xs leading-relaxed text-paper/40">
                  Los datos de la cuenta se envían al confirmar la admisión.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-paper/55">
        Una vez realizado el pago, cargá el comprobante {currency === "USD" ? "o el código MTCN " : ""}
        desde el formulario de admisión
        {whatsappHref && (
          <>
            {" "}o escribinos por{" "}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              WhatsApp
            </a>
          </>
        )}
        .
      </p>
    </div>
  );
}
