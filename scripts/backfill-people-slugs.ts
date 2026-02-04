import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../src/helpers/podcastHelpers";

const prisma = new PrismaClient();

async function backfillPersonSlugs() {
  console.log("🔄 Backfilling person slugs...");

  // Récupérer toutes les personnes sans slug
  const people = await prisma.person.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: "" },
      ],
    },
  });

  console.log(`Found ${people.length} people without slugs`);

  let updated = 0;
  let errors = 0;

  for (const person of people) {
    try {
      let slug = generateSlug(person.name);

      // Vérifier l'unicité
      const existing = await prisma.person.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== person.id) {
        // Ajouter l'ID TMDB pour unicité
        slug = `${slug}-${person.tmdbId}`;
        console.log(`⚠️  Duplicate slug found for "${person.name}", using: ${slug}`);
      }

      // Mettre à jour la personne
      await prisma.person.update({
        where: { id: person.id },
        data: { slug },
      });

      updated++;
      console.log(`✅ ${updated}/${people.length} - ${person.name} → ${slug}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error for ${person.name}:`, error);
    }
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
}

backfillPersonSlugs()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
