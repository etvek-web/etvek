/**
 * Build de producción con resolución robusta de la conexión a Postgres.
 *
 * Las integraciones de Vercel no usan un nombre único para la variable: Prisma Postgres
 * puede inyectar DATABASE_URL, PRISMA_DATABASE_URL o POSTGRES_URL, y además las prefija
 * con el nombre del store (por ejemplo `etvek_DATABASE_URL`). Algunas de esas cadenas son
 * de Accelerate (`prisma+postgres://`), que este proyecto no usa porque conecta directo.
 *
 * Este script junta todas las candidatas, descarta las que no son Postgres directo, expone
 * la primera usable como DATABASE_URL y recién entonces migra, siembra y compila.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, resolve } from "node:path";

// Sufijos en orden de preferencia: conexión directa antes que pooled.
const SUFFIXES = [
  "DATABASE_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
];

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    try {
      process.loadEnvFile(file);
    } catch {
      /* archivo ilegible: seguimos con las variables del entorno */
    }
  }
}

function fail(lines) {
  console.error(`\n✖ ${lines.join("\n")}\n`);
  process.exit(1);
}

/** Nombres candidatos: primero la coincidencia exacta, después cualquier `PREFIJO_SUFIJO`. */
function candidateNames() {
  const names = [];
  const seen = new Set();
  const add = (name) => {
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  };

  for (const suffix of SUFFIXES) {
    if (process.env[suffix] !== undefined) add(suffix);
    for (const key of Object.keys(process.env)) {
      if (key !== suffix && key.endsWith(`_${suffix}`)) add(key);
    }
  }
  return names;
}

const usable = [];
const accelerate = [];
const invalid = [];

for (const name of candidateNames()) {
  const value = (process.env[name] ?? "").trim();
  if (!value) continue;
  if (/^postgres(ql)?:\/\//.test(value)) usable.push({ name, value });
  else if (value.startsWith("prisma+postgres://")) accelerate.push(name);
  else invalid.push(name);
}

if (usable.length === 0) {
  const detail = [];
  if (accelerate.length) {
    detail.push(
      "",
      `Encontré cadenas de Accelerate (prisma+postgres://) en: ${accelerate.join(", ")}.`,
      "Este proyecto conecta directo a Postgres. En el panel de Prisma Postgres copiá la",
      "connection string que empieza con postgres:// y guardala como DATABASE_URL.",
    );
  }
  if (invalid.length) {
    detail.push("", `Estas variables tienen un valor que no parece Postgres: ${invalid.join(", ")}.`);
  }

  fail([
    "No hay conexión a la base de datos.",
    "",
    "Busqué una variable de Postgres con cualquiera de estos nombres, con o sin prefijo",
    "del store (por ejemplo `mistore_DATABASE_URL`):",
    ...SUFFIXES.map((name) => `  · ${name}`),
    ...detail,
    "",
    "En Vercel: Storage → Prisma Postgres → Connect Project, o cargá DATABASE_URL a mano",
    "en Settings → Environment Variables. Una variable creada pero vacía cuenta como ausente,",
    "y Production, Preview y Development se configuran por separado.",
  ]);
}

const chosen = usable[0];
if (chosen.name !== "DATABASE_URL") {
  console.log(`· Conexión tomada de ${chosen.name} y expuesta como DATABASE_URL.`);
  process.env.DATABASE_URL = chosen.value;
}
if (usable.length > 1) {
  console.log(`· Otras conexiones disponibles, sin usar: ${usable.slice(1).map((c) => c.name).join(", ")}.`);
}

// Permite ejecutar el script con `node` directo, no sólo vía `npm run`.
const localBin = resolve("node_modules/.bin");
process.env.PATH = `${localBin}${delimiter}${process.env.PATH ?? ""}`;

function run(command) {
  try {
    execSync(command, { stdio: "inherit", env: process.env });
  } catch {
    // El comando ya imprimió su propio error: no agregamos un stack trace de Node.
    process.exit(1);
  }
}

run("prisma generate");
run("prisma migrate deploy");
// El seed sólo crea lo que falta: nunca sobrescribe contenido editado desde /admin,
// así que es seguro en cada deploy.
run("prisma db seed");
run("next build");
