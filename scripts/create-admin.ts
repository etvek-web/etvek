/**
 * Crea o actualiza la usuaria administradora sin exponer la contraseña en el repo.
 * Uso: npm run admin:create -- --email eliana@etvek.com --name "Eliana Kestler"
 * La contraseña se toma de ADMIN_PASSWORD o se pide por stdin.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaClient } from "@prisma/client";
import { hashPassword, passwordIssues } from "../src/lib/password";

const prisma = new PrismaClient();

function arg(flag: string) {
  const i = process.argv.indexOf(`--${flag}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? (await rl.question("Email: "))).trim().toLowerCase();
  const name = arg("name") ?? process.env.ADMIN_NAME ?? (await rl.question("Nombre: "));
  const password = process.env.ADMIN_PASSWORD ?? (await rl.question("Contraseña (mín. 12 caracteres): "));
  rl.close();

  const issues = passwordIssues(password);
  if (issues.length) throw new Error(`Contraseña insegura: ${issues.join(" ")}`);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, isActive: true },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`Administradora lista: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
