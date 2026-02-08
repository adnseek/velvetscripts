import { PrismaClient } from "@prisma/client";
import { REAL_LOCATIONS, FICTIONAL_LOCATIONS, TABU_LOCATIONS } from "../lib/story-config";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding locations...");

  // Seed real locations
  for (const loc of REAL_LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: {
        name: loc.name,
        slug: loc.slug,
        description: loc.description,
        storyType: "real",
      },
    });
  }
  console.log(`✅ ${REAL_LOCATIONS.length} real locations seeded`);

  // Seed fictional locations
  for (const loc of FICTIONAL_LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: {
        name: loc.name,
        slug: loc.slug,
        description: loc.description,
        storyType: "fictional",
      },
    });
  }
  console.log(`✅ ${FICTIONAL_LOCATIONS.length} fictional locations seeded`);

  // Seed tabu locations
  for (const loc of TABU_LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: {
        name: loc.name,
        slug: loc.slug,
        description: loc.description,
        storyType: "tabu",
      },
    });
  }
  console.log(`✅ ${TABU_LOCATIONS.length} tabu locations seeded`);

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
