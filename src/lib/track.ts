/**
 * Registro interno de conversiones. Sólo nombres de evento y ruta:
 * nunca se envía el contenido de los formularios ni información sobre la voz o la salud.
 */
export type TrackableEvent =
  | "whatsapp_click"
  | "evaluacion_click"
  | "admission_submitted"
  | "program_selected"
  | "scheduler_opened";

export function trackEvent(name: TrackableEvent, path?: string) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ name, path: path ?? window.location.pathname });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
  } catch {
    /* la analítica nunca debe romper la navegación */
  }
}
