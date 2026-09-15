/**
 * Seed inicial de ETVEK.
 *
 * Estrictamente NO destructivo: sólo crea lo que falta y nunca sobrescribe un registro
 * existente. Por eso puede correr en cada deploy sin pisar las ediciones hechas desde
 * /admin. El contenido proviene del brief (Web ETVEK.pdf) y es el estado inicial editable.
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { COUNTRIES, CREDENTIALS, NAVIGATION, PAYMENT_METHODS, PROGRAMS, TIMELINE } from "./seed-content";
import { PAGES } from "./seed-pages";
import { hashPassword, passwordIssues } from "../src/lib/password";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = (process.env.ADMIN_NAME ?? "").trim() || "Eliana Kestler";

  if (!email || !password) {
    const count = await prisma.user.count();
    console.log(
      count > 0
        ? "· Admin: ya existe al menos un usuario, no se crea ninguno."
        : "· Admin: definí ADMIN_EMAIL y ADMIN_PASSWORD (o ejecutá `npm run admin:create`) para crear la administradora.",
    );
    return;
  }

  // El seed corre dentro del build: un problema acá nunca debe voltear el deploy.
  const issues = passwordIssues(password);
  if (issues.length) {
    console.warn(`⚠ ADMIN_PASSWORD insegura, no se creó la cuenta: ${issues.join(" ")}`);
    console.warn("  Creá la cuenta desde /admin/setup o corregí la variable.");
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { name, isActive: true },
      create: { email, name, passwordHash, role: "ADMIN" },
    });
    console.log(`· Admin listo: ${email}`);
    console.log("  Borrá ADMIN_PASSWORD de las variables de entorno después del primer ingreso.");
  } catch (error) {
    console.warn(`⚠ No se pudo crear la cuenta administradora: ${(error as Error).message}`);
    console.warn("  Podés crearla desde /admin/setup.");
  }
}

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "ETVEK",
      tagline: "Estudio Técnico Vocal de Eliana Kestler",
      contactEmail: "contacto@etvek.com",
      whatsappMessage: "Hola Eliana, me interesa solicitar una evaluación vocal en ETVEK.",
      legalReviewNote:
        "Los textos legales son un borrador técnico y requieren revisión de un asesor legal antes de su publicación definitiva.",
    },
  });

  // Países y programas tienen clave natural estable (code / slug): chequeo por registro.
  for (const [i, c] of COUNTRIES.entries()) {
    const existing = await prisma.country.findUnique({ where: { code: c.code } });
    if (!existing) await prisma.country.create({ data: { ...c, sortOrder: i } });
  }

  // Tablas sin clave natural: se siembran sólo si están vacías. Si Eliana renombró o
  // borró un registro, no lo recreamos ni lo duplicamos en el próximo deploy.
  if ((await prisma.credential.count()) === 0) {
    await prisma.credential.createMany({
      data: CREDENTIALS.map((c, i) => ({ ...c, sortOrder: i })),
    });
  }

  for (const [i, p] of PROGRAMS.entries()) {
    const { features, ...program } = p;
    const existing = await prisma.program.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    const saved = await prisma.program.create({ data: { ...program, sortOrder: i } });
    await prisma.programFeature.createMany({
      data: features.map((label, idx) => ({ programId: saved.id, label, sortOrder: idx })),
    });
  }

  if ((await prisma.timelineEvent.count()) === 0) {
    await prisma.timelineEvent.createMany({
      data: TIMELINE.map((t, i) => ({ ...t, sortOrder: i })),
    });
  }

  if ((await prisma.paymentMethod.count()) === 0) {
    await prisma.paymentMethod.createMany({
      data: PAYMENT_METHODS.map((m, i) => ({ ...m, sortOrder: i })),
    });
  }

  if ((await prisma.navigationItem.count()) === 0) {
    await prisma.navigationItem.createMany({ data: NAVIGATION });
  }

  for (const [pageIndex, page] of PAGES.entries()) {
    const existingPage = await prisma.page.findUnique({ where: { slug: page.slug } });
    const saved =
      existingPage ??
      (await prisma.page.create({ data: { slug: page.slug, title: page.title, sortOrder: pageIndex } }));

    const path = page.slug === "home" ? "/" : `/${page.slug}`;
    const existingSeo = await prisma.seoMetadata.findUnique({ where: { path } });
    if (!existingSeo) {
      await prisma.seoMetadata.create({ data: { path, pageId: saved.id, ...page.seo } });
    }

    for (const [i, section] of page.sections.entries()) {
      const { items = [], data, ...rest } = section;
      const existingSection = await prisma.pageSection.findUnique({
        where: { pageId_key: { pageId: saved.id, key: section.key } },
      });
      if (existingSection) continue;

      const savedSection = await prisma.pageSection.create({
        data: {
          ...rest,
          pageId: saved.id,
          sortOrder: i,
          data: (data ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });

      if (items.length) {
        await prisma.pageSectionItem.createMany({
          data: items.map((item, idx) => ({
            sectionId: savedSection.id,
            title: item.title,
            body: item.body ?? null,
            icon: item.icon ?? null,
            sortOrder: idx,
          })),
        });
      }
    }
  }

  await seedAdmin();
  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
