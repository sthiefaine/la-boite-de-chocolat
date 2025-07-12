"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { generateSlug } from "@/lib/podcastHelpers";

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
        message: `Le film "${existingFilm.title}" existe déjà dans la base de données`
      };
    }

    return { 
      success: true, 
      exists: false, 
      film: null,
      message: "Le film n'existe pas encore dans la base de données"
    };
  } catch (error) {
    console.error("Erreur vérification film:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de vérification",
    };
  }
}

export async function getOrCreateSagaFromTMDB(collectionName: string) {
  try {
    // Vérifier si la saga existe déjà
    let saga = await prisma.saga.findFirst({
      where: { name: collectionName },
    });

    // Si elle n'existe pas, la créer
    if (!saga) {
      saga = await prisma.saga.create({
        data: { name: collectionName },
      });
      console.log(`Saga créée: ${collectionName} (ID: ${saga.id})`);
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
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return { success: true, url: blob.url, filename: blob.pathname };
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
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Impossible de télécharger l'image depuis TMDB");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer]);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedTitle = filmTitle
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const filename = `films/poster_${sanitizedTitle}_${timestamp}.jpg`;

    // Upload vers Vercel Blob avec le SDK
    const blob = await put(filename, imageBlob, {
      access: "public",
      addRandomSuffix: true,
    });

    return { success: true, filename: blob.pathname };
  } catch (error) {
    console.error("Erreur upload poster TMDB:", error);
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
  age?: string
) {
  try {
    // Vérifier si le film existe déjà par son ID TMDB
    const existingFilm = await prisma.film.findUnique({
      where: { tmdbId: tmdbId }
    });

    if (existingFilm) {
      return { 
        success: false, 
        error: `Le film "${existingFilm.title}" existe déjà dans la base de données`,
        film: existingFilm
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
      const sagaResult = await getOrCreateSagaFromTMDB(detectedSagaName);
      if (sagaResult.success && sagaResult.saga) {
        finalSagaId = sagaResult.saga.id;
        console.log(`Saga automatiquement assignée: ${detectedSagaName}`);
      }
    }
    // Sinon, essayer de détecter depuis TMDB
    else if (tmdbMovie.belongs_to_collection) {
      const sagaResult = await getOrCreateSagaFromTMDB(
        tmdbMovie.belongs_to_collection.name
      );
      if (sagaResult.success && sagaResult.saga) {
        finalSagaId = sagaResult.saga.id;
        console.log(
          `Saga automatiquement assignée: ${tmdbMovie.belongs_to_collection.name}`
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
      },
    });

    // Revalider les pages
    revalidatePath("/admin/list/films");
    revalidatePath("/admin");

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
                pubDate: true,
                duration: true,
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

    // Si aucune saga n'existe, créer quelques sagas de test
    if (sagas.length === 0) {
      console.log("Aucune saga trouvée, création de sagas de test...");

      const testSagas = [
        { name: "Marvel Cinematic Universe" },
        { name: "Star Wars" },
        { name: "Harry Potter" },
        { name: "Lord of the Rings" },
        { name: "James Bond" },
      ];

      for (const sagaData of testSagas) {
        await prisma.saga.create({
          data: sagaData,
        });
      }

      // Récupérer les sagas créées
      const createdSagas = await prisma.saga.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      });

      return { success: true, sagas: createdSagas };
    }

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

    // Upload du poster si fourni
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

    // Générer le slug à partir du titre
    const baseSlug = generateSlug(data.title);

    // Vérifier si le slug existe déjà et ajouter un suffixe si nécessaire
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
        year: true,
        director: true,
        imgFileName: true,
        saga: {
          select: {
            name: true,
          },
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
