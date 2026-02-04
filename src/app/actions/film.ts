"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { uploadToServer, uploadImageFromUrl } from "@/helpers/uploadHelpers";
import { generateSlug } from "@/helpers/podcastHelpers";

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

export async function searchMovies(query: string) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key non configurée");
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=fr-FR&include_adult=false`,
      { next: { revalidate: 3600 } } // Cache 1 heure
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche TMDB");
    }

    const data: TMDBResponse = await response.json();
    return { success: true, movies: data.results };
  } catch (error) {
    console.error("Erreur recherche TMDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de recherche",
    };
  }
}

export async function getMovieDetails(tmdbId: number) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key non configurée");
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=fr-FR&append_to_response=credits,images,collection`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des détails");
    }

    const movie = await response.json();
    return { success: true, movie };
  } catch (error) {
    console.error("Erreur détails TMDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de récupération",
    };
  }
}

export async function getMovieCollection(tmdbId: number) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key non configurée");
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=fr-FR&append_to_response=collection`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des détails");
    }

    const movie = await response.json();

    return {
      success: true,
      collection: movie.belongs_to_collection || null,
      movie: {
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
      },
    };
  } catch (error) {
    console.error("Erreur récupération collection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de récupération",
    };
  }
}

export async function checkFilmExists(tmdbId: number) {
  try {
    const existingFilm = await prisma.film.findUnique({
      where: { tmdbId: tmdbId },
      include: {
        saga: true,
        links: {
          include: {
            podcast: {
              select: {
                id: true,
                title: true,
                pubDate: true,
              },
            },
          },
        },
      },
    });

    if (existingFilm) {
      return {
        success: true,
        exists: true,
        film: existingFilm,
        message: `Le film "${existingFilm.title}" existe déjà dans la base de données`,
      };
    }

    return {
      success: true,
      exists: false,
      film: null,
      message: "Le film n'existe pas encore dans la base de données",
    };
  } catch (error) {
    console.error("Erreur vérification film:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de vérification",
    };
  }
}

export async function getOrCreateSagaFromTMDB(
  collectionName: string,
  tmdbId?: number,
  collectionPosterPath?: string
) {
  try {
    let saga = await prisma.saga.findFirst({
      where: {
        OR: [{ name: collectionName }, ...(tmdbId ? [{ tmdbId: tmdbId }] : [])],
      },
    });

    let imgFileName: string | undefined;
    if (collectionPosterPath && (!saga || !saga.imgFileName)) {
      const uploadResult = await uploadSagaPosterFromTMDB(
        collectionPosterPath,
        collectionName
      );
      if (uploadResult.success) {
        imgFileName = uploadResult.filename;
      }
    }

    if (!saga) {
      saga = await prisma.saga.create({
        data: {
          name: collectionName,
          slug: generateSlug(collectionName),
          ...(tmdbId && { tmdbId: tmdbId }),
          ...(imgFileName && { imgFileName: imgFileName }),
        },
      });
    } else if ((tmdbId && !saga.tmdbId) || (imgFileName && !saga.imgFileName)) {
      saga = await prisma.saga.update({
        where: { id: saga.id },
        data: {
          ...(tmdbId && !saga.tmdbId && { tmdbId: tmdbId }),
          ...(imgFileName && !saga.imgFileName && { imgFileName: imgFileName }),
        },
      });
    }

    return { success: true, saga };
  } catch (error) {
    console.error("Erreur création saga:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de création",
    };
  }
}

export async function uploadImage(file: File, fileName: string) {
  try {
    const result = await uploadToServer(file, fileName, "films");

    if (result.success) {
      return { success: true, url: result.url, filename: result.filename };
    } else {
      return {
        success: false,
        error: result.error || "Erreur d'upload",
      };
    }
  } catch (error) {
    console.error("Erreur upload image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

export async function uploadPosterFromTMDB(
  posterPath: string,
  filmTitle: string
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    // Télécharger l'image depuis TMDB en qualité HD/Retina
    const imageUrl = `https://image.tmdb.org/t/p/w1280${posterPath}`;
    console.log("imageUrl", imageUrl);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedTitle = filmTitle
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const filename = `poster_${sanitizedTitle}_${timestamp}.jpg`;

    // Upload vers le serveur
    const result = await uploadImageFromUrl(imageUrl, filename, "films");

    if (result.success) {
      return { success: true, filename: result.filename };
    } else {
      return {
        success: false,
        error: result.error || "Erreur d'upload",
      };
    }
  } catch (error) {
    console.error("Erreur upload poster TMDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

export async function uploadSagaPosterFromTMDB(
  posterPath: string,
  sagaName: string
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    // Télécharger l'image depuis TMDB en qualité HD/Retina
    const imageUrl = `https://image.tmdb.org/t/p/w1280${posterPath}`;

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedName = sagaName
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const filename = `poster_${sanitizedName}_${timestamp}.jpg`;

    // Upload vers le serveur
    const result = await uploadImageFromUrl(imageUrl, filename, "sagas");

    if (result.success) {
      return { success: true, filename: result.filename };
    } else {
      return {
        success: false,
        error: result.error || "Erreur d'upload",
      };
    }
  } catch (error) {
    console.error("Erreur upload poster saga TMDB:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

export async function uploadSagaImage(file: File, sagaName: string) {
  try {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedName = sagaName
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const filename = `poster_${sanitizedName}_${timestamp}.jpg`;

    const result = await uploadToServer(file, filename, "sagas");

    if (result.success) {
      return { success: true, url: result.url, filename: result.filename };
    } else {
      return {
        success: false,
        error: result.error || "Erreur d'upload",
      };
    }
  } catch (error) {
    console.error("Erreur upload image saga:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur d'upload",
    };
  }
}

export async function createFilmFromTMDB(
  tmdbId: number,
  sagaId?: string,
  detectedSagaName?: string,
  age?: string,
  detectedSagaTmdbId?: number
) {
  try {
    // Vérifier si le film existe déjà par son ID TMDB
    const existingFilm = await prisma.film.findUnique({
      where: { tmdbId: tmdbId },
    });

    if (existingFilm) {
      return {
        success: false,
        error: `Le film "${existingFilm.title}" existe déjà dans la base de données`,
        film: existingFilm,
      };
    }

    // Récupérer les détails du film depuis TMDB
    const detailsResult = await getMovieDetails(tmdbId);
    if (!detailsResult.success) {
      throw new Error(detailsResult.error);
    }

    const tmdbMovie = detailsResult.movie;
    const year = tmdbMovie.release_date
      ? new Date(tmdbMovie.release_date).getFullYear()
      : null;

    // Upload du poster si disponible
    let imgFileName: string | undefined;
    if (tmdbMovie.poster_path) {
      const uploadResult = await uploadPosterFromTMDB(
        tmdbMovie.poster_path,
        tmdbMovie.title
      );
      if (uploadResult.success) {
        imgFileName = uploadResult.filename;
      }
    }

    // Gérer la saga
    let finalSagaId = sagaId;

    // Si une saga est sélectionnée manuellement, l'utiliser
    if (sagaId) {
      finalSagaId = sagaId;
    }
    // Sinon, si une saga a été détectée automatiquement, la créer/utiliser
    else if (detectedSagaName) {
      const sagaResult = await getOrCreateSagaFromTMDB(
        detectedSagaName,
        detectedSagaTmdbId
      );
      if (sagaResult.success && sagaResult.saga) {
        finalSagaId = sagaResult.saga.id;
        console.log(
          `Saga automatiquement assignée: ${detectedSagaName} (TMDB ID: ${
            detectedSagaTmdbId || "non défini"
          })`
        );
      }
    }
    // Sinon, essayer de détecter depuis TMDB
    else if (tmdbMovie.belongs_to_collection) {
      const sagaResult = await getOrCreateSagaFromTMDB(
        tmdbMovie.belongs_to_collection.name,
        tmdbMovie.belongs_to_collection.id,
        tmdbMovie.belongs_to_collection.poster_path
      );
      if (sagaResult.success && sagaResult.saga) {
        finalSagaId = sagaResult.saga.id;
        console.log(
          `Saga automatiquement assignée: ${tmdbMovie.belongs_to_collection.name} (TMDB ID: ${tmdbMovie.belongs_to_collection.id})`
        );
      }
    }

    // Générer le slug à partir du titre
    const baseSlug = generateSlug(tmdbMovie.title);

    // Vérifier si le slug existe déjà et ajouter un suffixe si nécessaire
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.film.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Extraire le réalisateur depuis les crédits TMDB
    let director: string | null = null;
    if (tmdbMovie.credits?.crew) {
      const directorInfo = tmdbMovie.credits.crew.find(
        (person: { job: string }) => person.job === "Director"
      );
      if (directorInfo) {
        director = directorInfo.name;
      }
    }

    // Récupérer budget et revenue depuis TMDB
    const tmdbBudget =
      tmdbMovie.budget && tmdbMovie.budget > 0
        ? BigInt(tmdbMovie.budget)
        : null;
    const tmdbRevenue =
      tmdbMovie.revenue && tmdbMovie.revenue > 0
        ? BigInt(tmdbMovie.revenue)
        : null;

    // Créer le film en base
    const film = await prisma.film.create({
      data: {
        title: tmdbMovie.title,
        slug: finalSlug,
        year: year,
        director: director,
        imgFileName: imgFileName || null,
        tmdbId: tmdbId,
        sagaId: finalSagaId || null,
        age: age || null,
        budget: tmdbBudget,
        revenue: tmdbRevenue,
      },
    });

    // Scraper et sauvegarder les personnes (réalisateurs et acteurs)
    try {
      await scrapeAndSaveFilmPeople(film.id, tmdbId);
      console.log(`✅ Personnes scrapées pour ${film.title}`);
    } catch (error) {
      console.error(`⚠️ Erreur lors du scraping des personnes pour ${film.title}:`, error);
      // On ne fail pas la création du film si le scraping échoue
    }

    // Revalider les pages
    revalidatePath("/admin/list/films");
    revalidatePath("/admin");
    revalidatePath("/episodes/budget");
    revalidatePath("/episodes/sagas");
    revalidatePath("/");

    return { success: true, film };
  } catch (error) {
    console.error("Erreur création film:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de création",
    };
  }
}

export async function getFilmBySlug(slug: string) {
  try {
    const film = await prisma.film.findUnique({
      where: { slug },
      include: {
        saga: true,
        links: {
          include: {
            podcast: {
              select: {
                id: true,
                title: true,
                slug: true,
                pubDate: true,
                duration: true,
                genre: true,
                audioUrl: true,
              },
            },
          },
        },
      },
    });

    if (!film) {
      return { success: false, error: "Film non trouvé" };
    }

    return { success: true, film };
  } catch (error) {
    console.error("Erreur récupération film:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de récupération",
    };
  }
}

export async function getSagas() {
  try {
    const sagas = await prisma.saga.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return { success: true, sagas };
  } catch (error) {
    console.error("Erreur récupération sagas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de récupération",
    };
  }
}

export async function createFilmManually(data: {
  title: string;
  year?: number;
  director?: string;
  sagaId?: string;
  age?: string;
  posterFile?: File;
}) {
  try {
    let imgFileName: string | undefined;

    if (data.posterFile) {
      const timestamp = Date.now();
      const sanitizedTitle = data.title
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const filename = `films/poster_${sanitizedTitle}_${timestamp}.jpg`;

      const uploadResult = await uploadImage(data.posterFile, filename);
      if (uploadResult.success) {
        imgFileName = uploadResult.filename;
      }
    }

    const baseSlug = generateSlug(data.title);

    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.film.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const film = await prisma.film.create({
      data: {
        title: data.title,
        slug: finalSlug,
        year: data.year || null,
        director: data.director || null,
        imgFileName: imgFileName || null,
        sagaId: data.sagaId || null,
        age: data.age || null,
      },
    });

    // Revalider les pages
    revalidatePath("/admin/list/films");
    revalidatePath("/admin");
    revalidatePath("/episodes/budget");
    revalidatePath("/episodes/sagas");
    revalidatePath("/");

    return { success: true, film };
  } catch (error) {
    console.error("Erreur création film manuel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de création",
    };
  }
}

export async function getAllFilms() {
  try {
    const films = await prisma.film.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        year: true,
        director: true,
        imgFileName: true,
        age: true,
        saga: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { links: true },
        },
      },
    });

    return { success: true, films };
  } catch (error) {
    console.error("Erreur récupération films:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de récupération",
    };
  }
}

/**
 * Met à jour le budget et revenue d'un film depuis TMDB
 */
export async function updateFilmBudgetFromTMDB(filmId: string) {
  try {
    const film = await prisma.film.findUnique({
      where: { id: filmId },
      select: { tmdbId: true, title: true },
    });

    if (!film?.tmdbId) {
      return { success: false, error: "Film sans ID TMDB" };
    }

    const detailsResult = await getMovieDetails(film.tmdbId);
    if (!detailsResult.success) {
      return { success: false, error: detailsResult.error };
    }

    const tmdbMovie = detailsResult.movie;
    const budget =
      tmdbMovie.budget && tmdbMovie.budget > 0
        ? BigInt(tmdbMovie.budget)
        : null;
    const revenue =
      tmdbMovie.revenue && tmdbMovie.revenue > 0
        ? BigInt(tmdbMovie.revenue)
        : null;

    await prisma.film.update({
      where: { id: filmId },
      data: { budget, revenue },
    });

    revalidatePath("/episodes/budget");
    revalidatePath("/episodes");
    revalidatePath("/");

    return { success: true, title: film.title, budget, revenue };
  } catch (error) {
    console.error("Erreur mise à jour budget:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de mise à jour",
    };
  }
}

/**
 * Backfill les budgets de tous les films qui ont un tmdbId mais pas de budget
 */
export async function backfillAllBudgets() {
  try {
    const films = await prisma.film.findMany({
      where: {
        tmdbId: { not: null },
        budget: null,
      },
      select: { id: true, tmdbId: true, title: true },
    });

    let updated = 0;
    let failed = 0;

    for (const film of films) {
      const result = await updateFilmBudgetFromTMDB(film.id);
      if (result.success) {
        updated++;
      } else {
        failed++;
      }
      // Petite pause pour ne pas surcharger l'API TMDB
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    return {
      success: true,
      total: films.length,
      updated,
      failed,
    };
  } catch (error) {
    console.error("Erreur backfill budgets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de backfill",
    };
  }
}

/**
 * Télécharge une photo de profil depuis TMDB et la sauvegarde localement
 */
async function uploadProfilePhotoFromTMDB(
  profilePath: string,
  personName: string,
  tmdbPersonId: number
): Promise<string | null> {
  if (!profilePath) return null;

  try {
    // Télécharger l'image depuis TMDB (w185 est une taille moyenne optimale pour les avatars)
    const imageUrl = `https://image.tmdb.org/t/p/w185${profilePath}`;

    // Sanitize person name for filename
    const sanitizedName = personName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const filename = `${sanitizedName}-${tmdbPersonId}.jpg`;

    // Upload vers le serveur en utilisant la fonction existante
    const result = await uploadImageFromUrl(imageUrl, filename, "people");

    if (result.success) {
      return result.filename ?? null;
    } else {
      console.error(`Failed to upload profile photo: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to upload profile photo for ${personName}:`, error);
    return null;
  }
}

/**
 * Crée ou récupère une personne dans la DB
 */
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

  // Générer le slug à partir du nom
  let slug = generateSlug(name);

  // Vérifier l'unicité du slug (au cas où deux personnes ont le même nom)
  const existingSlug = await prisma.person.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    // Ajouter l'ID TMDB pour rendre le slug unique
    slug = `${slug}-${tmdbId}`;
  }

  // Uploader la photo si disponible
  let photoFileName: string | null = null;
  if (profilePath) {
    photoFileName = await uploadProfilePhotoFromTMDB(profilePath, name, tmdbId);
  }

  // Créer la personne avec le slug
  person = await prisma.person.create({
    data: {
      name,
      slug,
      tmdbId,
      photoFileName,
    },
  });

  return person;
}

/**
 * Scrappe et sauvegarde les personnes (réalisateurs et acteurs) d'un film
 */
export async function scrapeAndSaveFilmPeople(filmId: string, tmdbId: number) {
  try {
    const detailsResult = await getMovieDetails(tmdbId);
    if (!detailsResult.success || !detailsResult.movie?.credits) {
      return { success: false, error: "No credits available" };
    }

    const { cast, crew } = detailsResult.movie.credits;
    const affectedPersonSlugs: string[] = [];

    // Traiter les réalisateurs
    const directors = crew.filter((c: any) => c.job === "Director");
    for (const directorData of directors) {
      const person = await getOrCreatePerson(
        directorData.name,
        directorData.id,
        directorData.profile_path
      );

      // Créer la relation si elle n'existe pas
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
          data: { filmId, personId: person.id },
        });
      }

      // Ajouter le slug pour revalidation
      if (person.slug) {
        affectedPersonSlugs.push(person.slug);
      }
    }

    // Traiter les acteurs (top 20)
    const topCast = cast.slice(0, 20);
    for (const actorData of topCast) {
      const person = await getOrCreatePerson(
        actorData.name,
        actorData.id,
        actorData.profile_path
      );

      // Créer la relation si elle n'existe pas
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
      }

      // Ajouter le slug pour revalidation
      if (person.slug) {
        affectedPersonSlugs.push(person.slug);
      }
    }

    // Revalider les pages des personnes affectées
    for (const slug of affectedPersonSlugs) {
      revalidatePath(`/people/${slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to scrape people for film ${filmId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Récupère les crédits (réalisateur et acteurs) d'un film depuis la DB
 */
export const getFilmCredits = unstable_cache(
  async (tmdbId: number) => {
    if (!tmdbId) return null;

    try {
      // Récupérer le film avec ses relations
      const film = await prisma.film.findUnique({
        where: { tmdbId },
        include: {
          directors: {
            include: {
              person: {
                select: {
                  name: true,
                  slug: true,
                  photoFileName: true,
                },
              },
            },
          },
          cast: {
            include: {
              person: {
                select: {
                  name: true,
                  slug: true,
                  photoFileName: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!film) return null;

      // Formater la réponse
      const director =
        film.directors.length > 0
          ? {
              name: film.directors[0].person.name,
              slug: film.directors[0].person.slug,
              photoFileName: film.directors[0].person.photoFileName,
            }
          : null;

      const cast = film.cast.map((c) => ({
        name: c.person.name,
        slug: c.person.slug,
        character: c.character || "",
        photoFileName: c.person.photoFileName,
      }));

      return {
        director,
        cast,
      };
    } catch (error) {
      console.error(`Failed to fetch credits for TMDB ID ${tmdbId}:`, error);
      return null;
    }
  },
  ["film-credits"],
  {
    revalidate: 86400, // 24 hours - credits don't change often
  }
);
