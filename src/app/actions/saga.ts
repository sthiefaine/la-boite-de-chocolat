"use server";

import { prisma } from "@/lib/prisma";

export async function getSagaWithFilms(sagaId: string) {
  try {
    const saga = await prisma.saga.findUnique({
      where: { id: sagaId },
      include: {
        films: {
          select: {
            id: true,
            title: true,
            year: true,
            slug: true,
            imgFileName: true,
            age: true,
            director: true,
          },
        },
      },
    });

    if (!saga) {
      return null;
    }

    const sortedFilms = saga.filmsOrder
      ? saga.filmsOrder
          .map((filmId) => saga.films.find((film) => film.id === filmId))
          .filter(Boolean)
      : saga.films;

    return {
      ...saga,
      films: sortedFilms,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la saga:", error);
    return null;
  }
}

export async function getSagaWithFilmsAndEpisodes(sagaId: string) {
  try {
    const saga = await prisma.saga.findUnique({
      where: { id: sagaId },
      include: {
        films: {
          select: {
            id: true,
            title: true,
            year: true,
            slug: true,
            imgFileName: true,
            age: true,
            director: true,
          },
        },
      },
    });

    if (!saga) {
      return null;
    }

    const sortedFilms = saga.filmsOrder
      ? saga.filmsOrder
          .map((filmId) => saga.films.find((film) => film.id === filmId))
          .filter(Boolean)
      : saga.films;

    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        links: {
          some: {
            film: {
              sagaId: sagaId,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        pubDate: true,
        links: {
          select: {
            film: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Créer un mapping film -> épisode
    const filmToEpisodeMap = new Map();
    episodes.forEach((episode) => {
      episode.links.forEach((link) => {
        filmToEpisodeMap.set(link.film.id, {
          id: episode.id,
          title: episode.title,
          slug: episode.slug,
          duration: episode.duration,
          pubDate: episode.pubDate,
        });
      });
    });

    return {
      saga: {
        ...saga,
        films: sortedFilms,
      },
      filmToEpisodeMap,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la saga avec épisodes:",
      error
    );
    return null;
  }
}
export async function searchCollection(
  query: string,
  page: number = 1
): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB API key non configurée");
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/collection?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(
        query
      )}&page=${page}`,
      { next: { revalidate: 3600 } } // Cache 1 heure
    );

    if (!response.ok) {
      throw new Error(`Erreur TMDB: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    if (!text) {
      throw new Error("Réponse vide de l'API TMDB");
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error("Erreur parsing JSON TMDB:", text);
      throw new Error(
        `Erreur parsing JSON: ${
          parseError instanceof Error ? parseError.message : "Erreur inconnue"
        }`
      );
    }
  } catch (error) {
    console.error("Erreur recherche collection TMDB:", error);
    throw error;
  }
}

export async function getAllSagasWithStats() {
  try {
    // Récupérer toutes les sagas avec leurs films
    const sagas = await prisma.saga.findMany({
      include: {
        films: {
          select: {
            id: true,
            title: true,
            year: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Récupérer tous les liens épisode-film en une seule requête
    const allEpisodeLinks = await prisma.podcastFilmLink.findMany({
      where: {
        film: {
          sagaId: {
            in: sagas.map(saga => saga.id),
          },
        },
      },
      select: {
        podcastId: true,
        film: {
          select: {
            sagaId: true,
          },
        },
      },
    });

    // Créer un map pour compter les épisodes uniques par saga
    const episodeCountBySaga = new Map();
    const uniqueEpisodesBySaga = new Map();

    allEpisodeLinks.forEach(link => {
      const sagaId = link.film.sagaId;
      if (!uniqueEpisodesBySaga.has(sagaId)) {
        uniqueEpisodesBySaga.set(sagaId, new Set());
      }
      uniqueEpisodesBySaga.get(sagaId).add(link.podcastId);
    });

    // Compter les épisodes uniques pour chaque saga
    uniqueEpisodesBySaga.forEach((episodeIds, sagaId) => {
      episodeCountBySaga.set(sagaId, episodeIds.size);
    });

    // Combiner les données
    const sagasWithEpisodeCount = sagas.map(saga => ({
      ...saga,
      episodeCount: episodeCountBySaga.get(saga.id) || 0,
    }));

    return { success: true, data: sagasWithEpisodeCount };
  } catch (error) {
    console.error("Erreur lors de la récupération des sagas avec statistiques:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des sagas",
    };
  }
}

export async function getSagaBySlug(slug: string) {
  try {
    const saga = await prisma.saga.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imgFileName: true,
        tmdbId: true,
        films: {
          select: {
            id: true,
            title: true,
            year: true,
            slug: true,
            imgFileName: true,
            age: true,
            director: true,
          },
        },
      },
    });

    if (!saga) {
      return { success: false, error: "Saga non trouvée" };
    }

    // Récupérer le nombre d'épisodes pour cette saga
    const episodeLinks = await prisma.podcastFilmLink.findMany({
      where: {
        film: {
          sagaId: saga.id,
        },
      },
      select: {
        podcastId: true,
      },
    });

    const uniqueEpisodeIds = new Set(episodeLinks.map(link => link.podcastId));
    const episodeCount = uniqueEpisodeIds.size;

    const sagaWithStats = {
      ...saga,
      episodeCount,
    };

    return { success: true, data: sagaWithStats };
  } catch (error) {
    console.error("Erreur lors de la récupération de la saga:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la saga",
    };
  }
}