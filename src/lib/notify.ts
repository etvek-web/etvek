import "server-only";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

/**
 * Aviso de nueva admisión a Eliana.
 * Si no hay proveedor de email configurado (RESEND_API_KEY), el aviso queda
 * registrado en el panel: /admin muestra las solicitudes nuevas en tiempo real.
 * Nunca se incluye el campo "objetivo" en integraciones externas de analítica.
 */
export async function notifyNewAdmission(admissionId: string) {
  const [admission, settings] = await Promise.all([
    prisma.admissionRequest.findUnique({ where: { id: admissionId }, include: { program: true } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!admission) return;

  const to = settings?.contactEmail ?? "contacto@etvek.com";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM;

  if (!apiKey || !from) return;

  const lines = [
    `Nombre: ${admission.fullName}`,
    `Email: ${admission.email}`,
    `WhatsApp: ${admission.dialCode} ${admission.whatsapp}`,
    `País: ${admission.countryName ?? "—"}`,
    `Estilo / proyecto: ${admission.style ?? "—"}`,
    `Nivel: ${admission.level}`,
    admission.program ? `Programa de interés: ${admission.program.name}` : null,
    "",
    "Objetivo principal:",
    admission.objective,
    "",
    `Ver en el panel: ${absoluteUrl(`/admin/admisiones/${admission.id}`)}`,
  ].filter(Boolean);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `Nueva solicitud de admisión — ${admission.fullName}`,
        text: lines.join("\n"),
      }),
    });
  } catch {
    // El registro en base ya quedó hecho; el aviso por email es best-effort.
  }
}
