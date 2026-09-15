import { cn } from "@/lib/utils";

/** Referencia gráfica acústica sutil: una onda de frecuencia trazada en línea fina. */
export function AcousticWave({ className, opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("h-full w-full", className)}
      style={{ opacity }}
    >
      <path className="wave-line" d="M0 80 Q 60 20 120 80 T 240 80 T 360 80 T 480 80 T 600 80 T 720 80 T 840 80 T 960 80 T 1080 80 T 1200 80" />
      <path
        className="wave-line"
        style={{ opacity: 0.4 }}
        d="M0 80 Q 40 130 80 80 T 160 80 T 240 80 T 320 80 T 400 80 T 480 80 T 560 80 T 640 80 T 720 80 T 800 80 T 880 80 T 960 80 T 1040 80 T 1120 80 T 1200 80"
      />
    </svg>
  );
}
