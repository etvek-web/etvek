"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle, Quote } from "lucide-react";

export type TestimonialData = {
  id: string;
  name: string;
  role: string | null;
  project: string | null;
  country: string | null;
  quote: string;
  instagram: string | null;
  videoUrl: string | null;
  image: { blobUrl: string; alt: string } | null;
};

/** Slider oscuro de testimonios. Sólo se monta si existen testimonios reales publicados. */
export function TestimonialSlider({ items }: { items: TestimonialData[] }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const current = items[index];
  const go = (dir: number) => setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <div className="relative border border-paper/10 bg-ink-800/70 p-8 sm:p-12">
      <Quote className="size-8 text-gold/50" strokeWidth={1.25} aria-hidden="true" />

      <blockquote className="mt-6" aria-live="polite">
        <p className="font-display text-xl leading-relaxed text-paper/90 sm:text-2xl">“{current.quote}”</p>
        <footer className="mt-8 flex items-center gap-4">
          {current.image && (
            <Image
              src={current.image.blobUrl}
              alt={current.image.alt || current.name}
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-paper">{current.name}</p>
            <p className="text-xs text-paper/50">
              {[current.role, current.project, current.country].filter(Boolean).join(" · ")}
            </p>
            {current.videoUrl && (
              <a
                href={current.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-paper/55 hover:text-gold"
              >
                <PlayCircle className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Ver testimonio en video
              </a>
            )}
            {current.instagram && (
              <a
                href={`https://instagram.com/${current.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold/80 hover:text-gold"
              >
                @{current.instagram.replace(/^@/, "")}
              </a>
            )}
          </div>
        </footer>
      </blockquote>

      {items.length > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Testimonio anterior"
            className="inline-flex size-10 items-center justify-center border border-paper/15 text-paper/70 transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Testimonio siguiente"
            className="inline-flex size-10 items-center justify-center border border-paper/15 text-paper/70 transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </button>
          <span className="ml-2 text-xs tabular-nums text-paper/40">
            {index + 1} / {items.length}
          </span>
        </div>
      )}
    </div>
  );
}
