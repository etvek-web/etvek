import "server-only";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { AUTH_SECRET_MIN_LENGTH, authSecretIssue } from "@/lib/config-check";

import { SESSION_COOKIE } from "@/lib/constants";

export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 7;

function secret() {
  const raw = process.env.AUTH_SECRET?.trim();
  if (!raw || raw.length < AUTH_SECRET_MIN_LENGTH) {
    throw new Error(
      `AUTH_SECRET no está definido o es demasiado corto (mínimo ${AUTH_SECRET_MIN_LENGTH} caracteres).`,
    );
  }
  return new TextEncoder().encode(raw);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export type SessionUser = { id: string; email: string; name: string; role: Role };

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const h = await headers();

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      expiresAt,
      userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
      ip: hashIp(h.get("x-forwarded-for")),
    },
  });

  const jwt = await new SignJWT({ sid: session.id, tok: raw })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

export function hashIp(ip: string | null | undefined) {
  if (!ip) return null;
  return sha256(`${ip.split(",")[0]?.trim()}|${process.env.AUTH_SECRET ?? ""}`).slice(0, 32);
}

/** Lee y valida la sesión. Cacheada por request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  // Sin un AUTH_SECRET válido ninguna sesión puede verificarse: devolvemos null en
  // lugar de lanzar, para que las páginas muestren el aviso de configuración y no un 500.
  if (authSecretIssue()) return null;

  const store = await cookies();
  const jwt = store.get(SESSION_COOKIE)?.value;
  if (!jwt) return null;

  let sid: string;
  let tok: string;
  try {
    const { payload } = await jwtVerify(jwt, secret());
    sid = String(payload.sid ?? "");
    tok = String(payload.tok ?? "");
    if (!sid || !tok) return null;
  } catch {
    return null;
  }

  const session = await prisma.session.findUnique({ where: { id: sid }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.tokenHash !== sha256(tok)) return null;
  if (!session.user.isActive) return null;

  const { id, email, name, role } = session.user;
  return { id, email, name, role };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const jwt = store.get(SESSION_COOKIE)?.value;
  if (jwt) {
    try {
      const { payload } = await jwtVerify(jwt, secret());
      await prisma.session.updateMany({
        where: { id: String(payload.sid), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* cookie inválida: solo la borramos */
    }
  }
  store.delete(SESSION_COOKIE);
}
