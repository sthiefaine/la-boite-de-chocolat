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

    // Trier les films selon filmsOrder
    const sortedFilms = saga.filmsOrder
      ? saga.filmsOrder
          .map((filmId) => saga.films.find((film) => film.id === filmId))
          .filter(Boolean)
      : saga.films;

    // Récupérer les épisodes qui correspondent aux films de la saga
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
