#!/usr/bin/env tsx
/**
 * Script pour backfill les personnes (réalisateurs et acteurs) depuis TMDB
 * Usage: npx tsx scripts/backfill-people.ts
 */

import { prisma } from "../src/lib/prisma";
import { uploadImageFromUrl } from "../src/helpers/uploadHelpers";

// Fonction pour récupérer les détails d'un film depuis TMDB
async function getMovieDetailsFromTMDB(tmdbId: number) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB API key non configurée");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=fr-FR&append_to_response=credits`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`Erreur TMDB: ${response.statusText}`);
  }

  const movie = await response.json();
  return movie;
}

// Fonction pour uploader une photo de profil depuis TMDB
async function uploadProfilePhotoFromTMDB(
  profilePath: string,
  personName: string,
  tmdbPersonId: number
): Promise<string | null> {
  if (!profilePath) return null;

  try {
    const imageUrl = `https://image.tmdb.org/t/p/w185${profilePath}`;
    const sanitizedName = personName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const filename = `${sanitizedName}-${tmdbPersonId}.jpg`;
    const result = await uploadImageFromUrl(imageUrl, filename, "people");

    if (result.success) {
      return result.filename ?? null;
    } else {
      console.error(`❌ Failed to upload photo for ${personName}: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to upload photo for ${personName}:`, error);
    return null;
  }
}

// Fonction pour créer ou récupérer une personne
async function getOrCreatePerson(
  name: string,
  tmdbId: number,
  profilePath: string | null
) {
  // Vérifier si la personne existe déjà
  let person = await prisma.person.findUnique({
    where: { tmdbId },
  });

  if (person) {
    return person;
  }

  // Uploader la photo si disponible
  let photoFileName: string | null = null;
  if (profilePath) {
    photoFileName = await uploadProfilePhotoFromTMDB(profilePath, name, tmdbId);
  }

  // Créer la personne
  person = await prisma.person.create({
    data: {
      name,
      tmdbId,
      photoFileName,
    },
  });

  console.log(`  ✅ Créé: ${name} (${tmdbId})`);
  return person;
}

// Fonction principale pour backfill un film
async function backfillFilmPeople(filmId: string, filmTitle: string, tmdbId: number) {
  console.log(`\n📽️  Film: ${filmTitle} (TMDB: ${tmdbId})`);

  try {
    // Récupérer les détails depuis TMDB
    const tmdbMovie = await getMovieDetailsFromTMDB(tmdbId);

    if (!tmdbMovie.credits) {
      console.log("  ⚠️  Pas de crédits disponibles");
      return;
    }

    const { cast, crew } = tmdbMovie.credits;

    // Traiter les réalisateurs
    const directors = crew.filter((c: any) => c.job === "Director");
    console.log(`  👤 Réalisateurs: ${directors.length}`);

    for (const directorData of directors) {
      const person = await getOrCreatePerson(
        directorData.name,
        directorData.id,
        directorData.profile_path
      );

      // Créer la relation film-director si elle n'existe pas
      const existingRelation = await prisma.filmDirector.findUnique({
        where: {
          filmId_personId: {
            filmId,
            personId: person.id,
          },
        },
      });

      if (!existingRelation) {
        await prisma.filmDirector.create({
          data: {
            filmId,
            personId: person.id,
          },
        });
        console.log(`    ➕ Lien créé avec ${person.name}`);
      }
    }

    // Traiter les acteurs (top 20)
    const topCast = cast.slice(0, 20);
    console.log(`  🎭 Acteurs: ${topCast.length}`);

    for (const actorData of topCast) {
      const person = await getOrCreatePerson(
        actorData.name,
        actorData.id,
        actorData.profile_path
      );

      // Créer la relation film-cast si elle n'existe pas
      const existingRelation = await prisma.filmCast.findUnique({
        where: {
          filmId_personId: {
            filmId,
            personId: person.id,
          },
        },
      });

      if (!existingRelation) {
        await prisma.filmCast.create({
          data: {
            filmId,
            personId: person.id,
            character: actorData.character || null,
            order: actorData.order || 0,
          },
        });
        console.log(`    ➕ Lien créé avec ${person.name} (${actorData.character})`);
      }
    }

    // Petite pause pour ne pas surcharger l'API TMDB
    await new Promise((resolve) => setTimeout(resolve, 250));
  } catch (error) {
    console.error(`  ❌ Erreur pour ${filmTitle}:`, error);
  }
}

// Fonction principale
async function main() {
  console.log("🚀 Démarrage du backfill des personnes...\n");

  // Récupérer tous les films avec un tmdbId
  const films = await prisma.film.findMany({
    where: {
      tmdbId: { not: null },
    },
    select: {
      id: true,
      title: true,
      tmdbId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`📊 ${films.length} films à traiter\n`);

  let processed = 0;
  let failed = 0;

  for (const film of films) {
    try {
      await backfillFilmPeople(film.id, film.title, film.tmdbId!);
      processed++;
    } catch (error) {
      console.error(`❌ Erreur pour ${film.title}:`, error);
      failed++;
    }
  }

  console.log("\n✅ Backfill terminé!");
  console.log(`   - Films traités: ${processed}`);
  console.log(`   - Films échoués: ${failed}`);
}

// Exécuter le script
main()
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
