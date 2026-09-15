import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function audit(
  user: SessionUser | null,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Prisma.InputJsonValue,
) {
  try {
    const h = await headers();
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        metadata,
        ip: hashIp(h.get("x-forwarded-for")),
      },
    });
  } catch {
    // La auditoría nunca debe romper la operación principal.
  }
}
