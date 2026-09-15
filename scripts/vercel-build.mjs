/**
 * Build de producción con resolución robusta de la conexión a Postgres.
 *
 * Las integraciones de Vercel no siempre inyectan la variable con el mismo nombre:
 * Prisma Postgres usa PRISMA_DATABASE_URL, los stores Postgres clásicos usan
 * POSTGRES_URL / POSTGRES_URL_NON_POOLING. Este script busca la primera que exista,
 * la expone como DATABASE_URL y recién entonces corre migraciones y build.
 * Si no encuentra ninguna, falla con un mensaje que dice exactamente qué hacer.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, resolve } from "node:path";

// Prioridad: conexión directa antes que pooled (las migraciones no pasan por el pooler).
const CANDIDATES = [
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

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const found = CANDIDATES.find((name) => (process.env[name] ?? "").trim().length > 0);

if (!found) {
  fail(
    [
      "No hay conexión a la base de datos.",
      "",
      "Ninguna de estas variables tiene valor:",
      ...CANDIDATES.map((name) => `  · ${name}`),
      "",
      "En Vercel: Storage → Prisma Postgres → Connect Project, o cargá DATABASE_URL",
      "a mano en Settings → Environment Variables (y marcá el entorno correcto:",
      "Production, Preview y Development se configuran por separado).",
      "",
      "Una variable creada pero vacía cuenta como ausente.",
    ].join("\n"),
  );
}

const url = process.env[found].trim();

if (url.startsWith("prisma+postgres://")) {
  fail(
    [
      `${found} usa el protocolo prisma+postgres:// (conexión vía Accelerate).`,
      "",
      "Este proyecto conecta directo a Postgres, así que necesita la cadena directa.",
      "En el dashboard de Prisma Postgres copiá la connection string que empieza con",
      "postgres:// o postgresql:// y guardala como DATABASE_URL en Vercel.",
    ].join("\n"),
  );
}

if (!/^postgres(ql)?:\/\//.test(url)) {
  fail(`${found} no parece una cadena de conexión de Postgres (debe empezar con postgres:// o postgresql://).`);
}

if (found !== "DATABASE_URL") {
  console.log(`· Conexión tomada de ${found} y expuesta como DATABASE_URL.`);
  process.env.DATABASE_URL = url;
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
run("next build");
