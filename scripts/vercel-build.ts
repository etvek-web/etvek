/**
 * Build de producción.
 *
 * Resuelve la conexión a Postgres con el mismo módulo que usa el runtime
 * (src/lib/database-url), la expone como DATABASE_URL para los comandos de Prisma,
 * aplica migraciones, corre el seed y compila.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, resolve } from "node:path";
import { missingDatabaseUrlMessage, resolveDatabaseUrl } from "../src/lib/database-url";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    try {
      process.loadEnvFile(file);
    } catch {
      /* archivo ilegible: seguimos con las variables del entorno */
    }
  }
}

const resolved = resolveDatabaseUrl();

if (!resolved) {
  console.error(`\n✖ ${missingDatabaseUrlMessage()}\n`);
  process.exit(1);
}

if (resolved.source !== "DATABASE_URL") {
  console.log(`· Conexión tomada de ${resolved.source} y expuesta como DATABASE_URL.`);
  process.env.DATABASE_URL = resolved.url;
}
if (resolved.alternatives.length) {
  console.log(`· Otras conexiones disponibles, sin usar: ${resolved.alternatives.join(", ")}.`);
}
if (resolved.accelerate.length) {
  console.log(`· Ignoradas por ser de Accelerate: ${resolved.accelerate.join(", ")}.`);
}

// Permite ejecutar el script sin pasar por los scripts de npm.
process.env.PATH = `${resolve("node_modules/.bin")}${delimiter}${process.env.PATH ?? ""}`;

function run(command: string) {
  try {
    execSync(command, { stdio: "inherit", env: process.env });
  } catch {
    // El comando ya imprimió su propio error: no agregamos un stack trace de Node.
    process.exit(1);
  }
}

run("prisma generate");
run("prisma migrate deploy");
// El seed sólo crea lo que falta: nunca sobrescribe contenido editado desde /admin.
run("prisma db seed");
run("next build");
