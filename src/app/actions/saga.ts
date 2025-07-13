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