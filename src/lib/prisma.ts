import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * La URL se resuelve en runtime y no sólo en el build: en Vercel la integración
 * puede exponer la conexión como `<store>_DATABASE_URL`, y las funciones no verían
 * una DATABASE_URL reescrita durante el build.
 */
function createClient() {
  const resolved = resolveDatabaseUrl();
  const log = (process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
  return resolved
    ? new PrismaClient({ datasourceUrl: resolved.url, log })
    : new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
