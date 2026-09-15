"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashIp, requireUser } from "@/lib/auth";
import { verifyPassword, hashPassword, passwordIssues } from "@/lib/password";
import { loginSchema, accountSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { adminConfigIssues } from "@/lib/config-check";

export type LoginState = { status: "idle" } | { status: "error"; message: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const issues = adminConfigIssues();
  if (issues.length) {
    return {
      status: "error",
      message: `Falta configurar el entorno: ${issues.map((i) => i.variable).join(", ")}.`,
    };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Ingresá un email y una contraseña válidos." };

  const h = await headers();
  const ipHash = hashIp(h.get("x-forwarded-for")) ?? "anon";
  const byIp = await rateLimit(`login:${ipHash}`, 10, 15 * 60 * 1000);
  const byEmail = await rateLimit(`login:${parsed.data.email}`, 8, 15 * 60 * 1000);
  if (!byIp.ok || !byEmail.ok) {
    return { status: "error", message: "Demasiados intentos. Esperá unos minutos antes de reintentar." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && user.isActive ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid) {
    await audit(null, "LOGIN_FAILED", "User", user?.id ?? null, { email: parsed.data.email });
    // Mensaje genérico: no revelamos si el email existe.
    return { status: "error", message: "Email o contraseña incorrectos." };
  }

  await createSession(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ id: user.id, email: user.email, name: user.name, role: user.role }, "LOGIN", "User", user.id);

  redirect("/admin");
}

export async function logout() {
  const user = await requireUser().catch(() => null);
  if (user) await audit(user, "LOGOUT", "User", user.id);
  await destroySession();
  redirect("/admin/login");
}

export type AccountState = { status: "idle" } | { status: "error"; message: string } | { status: "success"; message: string };

export async function updateAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const current = await requireUser();
  const parsed = accountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { name, email, currentPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: current.id } });

  const data: { name: string; email: string; passwordHash?: string } = { name, email };

  if (newPassword) {
    const ok = await verifyPassword(currentPassword ?? "", user.passwordHash);
    if (!ok) return { status: "error", message: "La contraseña actual no es correcta." };
    const issues = passwordIssues(newPassword);
    if (issues.length) return { status: "error", message: issues.join(" ") };
    data.passwordHash = await hashPassword(newPassword);
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch {
    return { status: "error", message: "Ese email ya está en uso." };
  }

  if (data.passwordHash) {
    // Cambiar la contraseña cierra el resto de las sesiones abiertas.
    await prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await createSession(user.id);
  }

  await audit(current, "UPDATE_ACCOUNT", "User", user.id, { passwordChanged: Boolean(data.passwordHash) });
  return { status: "success", message: "Cuenta actualizada." };
}
