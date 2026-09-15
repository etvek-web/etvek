import "server-only";
import { resolveDatabaseUrl } from "@/lib/database-url";

/**
 * Chequeo de configuración de runtime.
 *
 * Sin esto, una variable de entorno faltante se manifiesta como un 500 opaco
 * ("Application error… Digest: …"), que no le dice nada a quien tiene que arreglarlo.
 * Las pantallas del panel usan esto para mostrar qué falta y cómo resolverlo.
 */
export type ConfigIssue = { variable: string; problem: string; fix: string };

export const AUTH_SECRET_MIN_LENGTH = 32;

export function authSecretIssue(): ConfigIssue | null {
  const value = process.env.AUTH_SECRET ?? "";
  if (!value.trim()) {
    return {
      variable: "AUTH_SECRET",
      problem: "No está definida, o quedó creada sin valor.",
      fix: "Generala con `openssl rand -base64 48` y cargala en Vercel → Settings → Environment Variables.",
    };
  }
  if (value.trim().length < AUTH_SECRET_MIN_LENGTH) {
    return {
      variable: "AUTH_SECRET",
      problem: `Tiene ${value.trim().length} caracteres y necesita al menos ${AUTH_SECRET_MIN_LENGTH}.`,
      fix: "Generá una nueva con `openssl rand -base64 48` y reemplazala en Vercel.",
    };
  }
  return null;
}

export function databaseIssue(): ConfigIssue | null {
  if (resolveDatabaseUrl()) return null;
  return {
    variable: "DATABASE_URL",
    problem: "No hay ninguna conexión a Postgres disponible.",
    fix: "Vinculá el store en Vercel → Storage → Connect Project, o cargá DATABASE_URL a mano.",
  };
}

/** Problemas que impiden que el panel funcione. */
export function adminConfigIssues(): ConfigIssue[] {
  return [authSecretIssue(), databaseIssue()].filter((i): i is ConfigIssue => i !== null);
}
