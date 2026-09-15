import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Rate limit persistido en Postgres (sin dependencias externas).
 * Limpia oportunísticamente los registros vencidos.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (count >= limit) return { ok: false as const, remaining: 0 };

  await prisma.rateLimitHit.create({ data: { key } });
  if (Math.random() < 0.05) {
    await prisma.rateLimitHit
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
      .catch(() => undefined);
  }
  return { ok: true as const, remaining: limit - count - 1 };
}
