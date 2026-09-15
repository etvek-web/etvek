/**
 * Seed inicial de ETVEK. Idempotente: puede ejecutarse varias veces.
 * Usa el contenido del brief (Web ETVEK.pdf) como estado inicial editable desde /admin.
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { COUNTRIES, CREDENTIALS, NAVIGATION, PAYMENT_METHODS, PROGRAMS, TIMELINE } from "./seed-content";
import { PAGES } from "./seed-pages";
import { hashPassword, passwordIssues } from "../src/lib/password";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "Eliana Kestler";

  if (!email || !password) {
    const count = await prisma.user.count();
    console.log(
      count > 0
        ? "· Admin: ya existe al menos un usuario, no se crea ninguno."
        : "· Admin: definí ADMIN_EMAIL y ADMIN_PASSWORD (o ejecutá `npm run admin:create`) para crear la administradora.",
    );
    return;
  }

  const issues = passwordIssues(password);
  if (issues.length) throw new Error(`ADMIN_PASSWORD insegura: ${issues.join(" ")}`);

  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { name, isActive: true },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`· Admin listo: ${email}`);
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

  for (const [i, c] of COUNTRIES.entries()) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, dialCode: c.dialCode, flag: c.flag, timezone: c.timezone, sortOrder: i },
      create: { ...c, sortOrder: i },
    });
  }

  for (const [i, c] of CREDENTIALS.entries()) {
    const existing = await prisma.credential.findFirst({ where: { label: c.label } });
    if (existing) {
      await prisma.credential.update({ where: { id: existing.id }, data: { ...c, sortOrder: i } });
    } else {
      await prisma.credential.create({ data: { ...c, sortOrder: i } });
    }
  }

  for (const [i, p] of PROGRAMS.entries()) {
    const { features, ...program } = p;
    const saved = await prisma.program.upsert({
      where: { slug: p.slug },
      update: { ...program, sortOrder: i },
      create: { ...program, sortOrder: i },
    });
    await prisma.programFeature.deleteMany({ where: { programId: saved.id } });
    await prisma.programFeature.createMany({
      data: features.map((label, idx) => ({ programId: saved.id, label, sortOrder: idx })),
    });
  }

  for (const [i, t] of TIMELINE.entries()) {
    const existing = await prisma.timelineEvent.findFirst({ where: { title: t.title } });
    if (existing) {
      await prisma.timelineEvent.update({ where: { id: existing.id }, data: { ...t, sortOrder: i } });
    } else {
      await prisma.timelineEvent.create({ data: { ...t, sortOrder: i } });
    }
  }

  for (const [i, m] of PAYMENT_METHODS.entries()) {
    const existing = await prisma.paymentMethod.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.paymentMethod.update({ where: { id: existing.id }, data: { ...m, sortOrder: i } });
    } else {
      await prisma.paymentMethod.create({ data: { ...m, sortOrder: i } });
    }
  }

  for (const n of NAVIGATION) {
    const existing = await prisma.navigationItem.findFirst({ where: { href: n.href, location: n.location } });
    if (existing) {
      await prisma.navigationItem.update({ where: { id: existing.id }, data: n });
    } else {
      await prisma.navigationItem.create({ data: n });
    }
  }

  for (const [pageIndex, page] of PAGES.entries()) {
    const saved = await prisma.page.upsert({
      where: { slug: page.slug },
      update: { title: page.title, sortOrder: pageIndex },
      create: { slug: page.slug, title: page.title, sortOrder: pageIndex },
    });

    const path = page.slug === "home" ? "/" : `/${page.slug}`;
    await prisma.seoMetadata.upsert({
      where: { path },
      update: { pageId: saved.id },
      create: { path, pageId: saved.id, ...page.seo },
    });

    for (const [i, section] of page.sections.entries()) {
      const { items = [], data, ...rest } = section;
      const savedSection = await prisma.pageSection.upsert({
        where: { pageId_key: { pageId: saved.id, key: section.key } },
        update: { sortOrder: i },
        create: {
          ...rest,
          pageId: saved.id,
          sortOrder: i,
          data: (data ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
      const itemCount = await prisma.pageSectionItem.count({ where: { sectionId: savedSection.id } });
      if (itemCount === 0 && items.length) {
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
