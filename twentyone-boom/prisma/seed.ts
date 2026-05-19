import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COMPETENCES, BADGES, STARTER_TIPS } from "../lib/competence-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ----- Competences + Indicators -----
  for (let i = 0; i < COMPETENCES.length; i++) {
    const c = COMPETENCES[i];
    await prisma.competence.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        description: c.description,
        orderIndex: i,
      },
      update: {
        name: c.name,
        icon: c.icon,
        description: c.description,
        orderIndex: i,
      },
    });

    // Wipe existing indicators for this competence (idempotent seed)
    await prisma.indicator.deleteMany({ where: { competenceSlug: c.slug } });

    for (let j = 0; j < c.indicators.length; j++) {
      const ind = c.indicators[j];
      await prisma.indicator.create({
        data: {
          competenceSlug: c.slug,
          level: ind.level,
          text: ind.text,
          orderIndex: j,
        },
      });
    }
  }
  console.log(`✓ ${COMPETENCES.length} competenties + indicatoren geseed`);

  // ----- Badges -----
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      create: b,
      update: b,
    });
  }
  console.log(`✓ ${BADGES.length} badges geseed`);

  // ----- Tips -----
  await prisma.tip.deleteMany();
  for (const t of STARTER_TIPS) {
    await prisma.tip.create({ data: t });
  }
  console.log(`✓ ${STARTER_TIPS.length} tips geseed`);

  // ----- Demo users -----
  const hash = await bcrypt.hash("welkom123", 10);

  const lotte = await prisma.user.upsert({
    where: { email: "lotte@school.nl" },
    create: {
      email: "lotte@school.nl",
      name: "Lotte de Vries",
      passwordHash: hash,
      role: "STUDENT",
      className: "O&O 3A",
      birthYear: 2012,
    },
    update: {},
  });
  await prisma.tree.upsert({
    where: { userId: lotte.id },
    create: { userId: lotte.id },
    update: {},
  });

  const sem = await prisma.user.upsert({
    where: { email: "sem@school.nl" },
    create: {
      email: "sem@school.nl",
      name: "Sem Bakker",
      passwordHash: hash,
      role: "STUDENT",
      className: "O&O 3A",
      birthYear: 2012,
    },
    update: {},
  });
  await prisma.tree.upsert({
    where: { userId: sem.id },
    create: { userId: sem.id },
    update: {},
  });

  const mira = await prisma.user.upsert({
    where: { email: "mira@school.nl" },
    create: {
      email: "mira@school.nl",
      name: "Mira Janssen",
      passwordHash: hash,
      role: "STUDENT",
      className: "O&O 3A",
      birthYear: 2012,
    },
    update: {},
  });
  await prisma.tree.upsert({
    where: { userId: mira.id },
    create: { userId: mira.id },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "docent@school.nl" },
    create: {
      email: "docent@school.nl",
      name: "Mw. de Boer",
      passwordHash: hash,
      role: "TEACHER",
    },
    update: {},
  });

  console.log("✓ Demo gebruikers aangemaakt");
  console.log("");
  console.log("Inloggen:");
  console.log("  Leerling:  lotte@school.nl  /  welkom123");
  console.log("  Leerling:  sem@school.nl    /  welkom123");
  console.log("  Leerling:  mira@school.nl   /  welkom123");
  console.log("  Docent:    docent@school.nl /  welkom123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
