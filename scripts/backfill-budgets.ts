import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function getMovieBudget(tmdbId: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const movie = await response.json();
  return {
    budget: movie.budget && movie.budget > 0 ? BigInt(movie.budget) : null,
    revenue: movie.revenue && movie.revenue > 0 ? BigInt(movie.revenue) : null,
  };
}

async function main() {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not set");
    process.exit(1);
  }

  const films = await prisma.film.findMany({
    where: {
      tmdbId: { not: null },
      budget: null,
    },
    select: { id: true, tmdbId: true, title: true },
  });

  console.log(`Found ${films.length} films to backfill`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const film of films) {
    try {
      const data = await getMovieBudget(film.tmdbId!);

      if (data.budget || data.revenue) {
        await prisma.film.update({
          where: { id: film.id },
          data: {
            budget: data.budget,
            revenue: data.revenue,
          },
        });
        updated++;
        const budgetStr = data.budget
          ? `${(Number(data.budget) / 1_000_000).toFixed(1)}M$`
          : "N/A";
        const revenueStr = data.revenue
          ? `${(Number(data.revenue) / 1_000_000).toFixed(1)}M$`
          : "N/A";
        console.log(
          `  ✓ ${film.title} — Budget: ${budgetStr}, Revenue: ${revenueStr}`
        );
      } else {
        skipped++;
        console.log(`  - ${film.title} — No budget data on TMDB`);
      }

      // Rate limiting: 250ms between requests
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      failed++;
      console.error(
        `  ✗ ${film.title} — Error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main();
