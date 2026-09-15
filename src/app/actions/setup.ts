"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, hashIp } from "@/lib/auth";
import { hashPassword, passwordIssues } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { z } from "zod";

const setupSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresá tu nombre.").max(120),
    email: z.string().trim().toLowerCase().email("Email inválido."),
    password: z.string(),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

export type SetupState = { status: "idle" } | { status: "error"; message: string };

/**
 * Creación de la primera cuenta administradora.
 *
 * NO es un registro público: sólo funciona mientras la tabla de usuarias está vacía.
 * En cuanto existe una cuenta, esta acción y la pantalla /admin/setup quedan cerradas
 * para siempre. Es el mecanismo de inicialización equivalente al script de consola,
 * para poder completar el alta sin una terminal con acceso a la base.
 */
export async function createFirstAdmin(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const h = await headers();
  const limited = await rateLimit(`setup:${hashIp(h.get("x-forwarded-for")) ?? "anon"}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return { status: "error", message: "Demasiados intentos. Esperá unos minutos." };

  if ((await prisma.user.count()) > 0) {
    return { status: "error", message: "Ya existe una cuenta administradora. Usá el ingreso normal." };
  }

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const issues = passwordIssues(parsed.data.password);
  if (issues.length) return { status: "error", message: issues.join(" ") };

  const passwordHash = await hashPassword(parsed.data.password);

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "ADMIN" },
    });
    userId = user.id;
  } catch {
    // Carrera improbable: otra alta ganó entre el conteo y el create.
    return { status: "error", message: "No se pudo crear la cuenta. Recargá la página." };
  }

  await createSession(userId);
  await audit({ id: userId, email: parsed.data.email, name: parsed.data.name, role: "ADMIN" }, "SETUP_FIRST_ADMIN", "User", userId);

  redirect("/admin");
}
