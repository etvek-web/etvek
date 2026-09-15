import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/auth";

const ALLOWED = new Set([
  "whatsapp_click",
  "evaluacion_click",
  "admission_submitted",
  "program_selected",
  "scheduler_opened",
]);

/**
 * Conversiones internas. Sólo nombre de evento y ruta: nunca datos personales,
 * ni el contenido del campo "objetivo", ni información de salud vocal.
 */
export async function POST(request: Request) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.analyticsEnabled) return new NextResponse(null, { status: 204 });

  const h = await headers();
  const limited = await rateLimit(`track:${hashIp(h.get("x-forwarded-for")) ?? "anon"}`, 60, 60 * 1000);
  if (!limited.ok) return new NextResponse(null, { status: 204 });

  try {
    const body = (await request.json()) as { name?: string; path?: string };
    if (!body.name || !ALLOWED.has(body.name)) return new NextResponse(null, { status: 204 });
    await prisma.analyticsEvent.create({
      data: { name: body.name, path: typeof body.path === "string" ? body.path.slice(0, 200) : null },
    });
  } catch {
    /* evento descartado */
  }
  return new NextResponse(null, { status: 204 });
}
