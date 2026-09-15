/**
 * Resolución de la conexión a Postgres, compartida por el build y el runtime.
 *
 * Las integraciones de Vercel no usan un nombre único: Prisma Postgres inyecta
 * DATABASE_URL, PRISMA_DATABASE_URL y POSTGRES_URL, y las prefija con el nombre del
 * store (`etvek_DATABASE_URL`). Algunas son cadenas de Accelerate (`prisma+postgres://`),
 * que este proyecto no usa porque conecta directo.
 *
 * Este módulo es la única fuente de verdad: lo usan scripts/vercel-build.ts, el cliente
 * de Prisma y el seed. Sin esto, el build resolvía la variable pero las funciones en
 * runtime no la encontraban.
 */

/** Sufijos en orden de preferencia: conexión directa antes que pooled. */
export const URL_SUFFIXES = [
  "DATABASE_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const;

export type ResolvedDatabaseUrl = {
  url: string;
  source: string;
  /** Otras variables con una conexión válida que no se usaron. */
  alternatives: string[];
  /** Variables con cadenas de Accelerate, que este proyecto no puede usar. */
  accelerate: string[];
};

/** Nombres candidatos: primero la coincidencia exacta, después cualquier `PREFIJO_SUFIJO`. */
function candidateNames(env: NodeJS.ProcessEnv) {
  const names: string[] = [];
  const seen = new Set<string>();
  const add = (name: string) => {
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  };

  for (const suffix of URL_SUFFIXES) {
    if (env[suffix] !== undefined) add(suffix);
    for (const key of Object.keys(env)) {
      if (key !== suffix && key.endsWith(`_${suffix}`)) add(key);
    }
  }
  return names;
}

export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): ResolvedDatabaseUrl | null {
  const usable: { name: string; value: string }[] = [];
  const accelerate: string[] = [];

  for (const name of candidateNames(env)) {
    // Una variable definida pero vacía cuenta como ausente: así quedan al crearlas sin valor.
    const value = (env[name] ?? "").trim();
    if (!value) continue;
    if (/^postgres(ql)?:\/\//.test(value)) usable.push({ name, value });
    else if (value.startsWith("prisma+postgres://")) accelerate.push(name);
  }

  if (usable.length === 0) return null;

  return {
    url: usable[0].value,
    source: usable[0].name,
    alternatives: usable.slice(1).map((c) => c.name),
    accelerate,
  };
}

/** Mensaje de error accionable cuando no hay ninguna conexión usable. */
export function missingDatabaseUrlMessage(env: NodeJS.ProcessEnv = process.env) {
  const accelerate: string[] = [];
  for (const name of candidateNames(env)) {
    if ((env[name] ?? "").trim().startsWith("prisma+postgres://")) accelerate.push(name);
  }

  const lines = [
    "No hay conexión a la base de datos.",
    "",
    "Busqué una variable de Postgres con cualquiera de estos nombres, con o sin prefijo",
    "del store (por ejemplo `mistore_DATABASE_URL`):",
    ...URL_SUFFIXES.map((name) => `  · ${name}`),
  ];

  if (accelerate.length) {
    lines.push(
      "",
      `Encontré cadenas de Accelerate (prisma+postgres://) en: ${accelerate.join(", ")}.`,
      "Este proyecto conecta directo a Postgres. En el panel de Prisma Postgres copiá la",
      "connection string que empieza con postgres:// y guardala como DATABASE_URL.",
    );
  }

  lines.push(
    "",
    "En Vercel: Storage → Prisma Postgres → Connect Project, o cargá DATABASE_URL a mano",
    "en Settings → Environment Variables. Una variable creada pero vacía cuenta como ausente,",
    "y Production, Preview y Development se configuran por separado.",
  );

  return lines.join("\n");
}
