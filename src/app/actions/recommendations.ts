"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const episodeSelect = {
  id: true,
  title: true,
  slug: true,
  pubDate: true,
  duration: true,
  genre: true,
  links: {
    select: {
      film: {
        select: {
          id: true,
          title: true,
          slug: true,
          year: true,
          imgFileName: true,
          age: true,
          saga: { select: { name: true, id: true } },
        },
      },
    },
    take: 1,
  },
} as const;

export async function getRecommendations(episodeId: string, limit = 6) {
  try {
    const currentEpisode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: {
        id: true,
        genre: true,
        links: {
          select: {
            film: {
              select: {
                sagaId: true,
                director: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!currentEpisode) return [];

    const sagaId = currentEpisode.links[0]?.film?.sagaId;
    const director = currentEpisode.links[0]?.film?.director;
    const genre = currentEpisode.genre;

    type RecommendedEpisode = Prisma.PodcastEpisodeGetPayload<{ select: typeof episodeSelect }>;
    const recommendations = new Map<string, RecommendedEpisode>();

    // 1. Same saga
    if (sagaId) {
      const sagaEpisodes = await prisma.podcastEpisode.findMany({
        where: {
          id: { not: episodeId },
          links: { some: { film: { sagaId } } },
        },
        select: episodeSelect,
        take: limit,
      });
      for (const ep of sagaEpisodes) {
        if (!recommendations.has(ep.id)) recommendations.set(ep.id, ep);
      }
    }

    // 2. Same genre
    if (genre && recommendations.size < limit) {
      const genreEpisodes = await prisma.podcastEpisode.findMany({
        where: {
          id: { not: episodeId },
          genre,
        },
        select: episodeSelect,
        take: limit - recommendations.size,
        orderBy: { pubDate: "desc" },
      });
      for (const ep of genreEpisodes) {
        if (!recommendations.has(ep.id)) recommendations.set(ep.id, ep);
      }
    }

    // 3. Same director
    if (director && recommendations.size < limit) {
      const directorEpisodes = await prisma.podcastEpisode.findMany({
        where: {
          id: { not: episodeId },
          links: { some: { film: { director } } },
        },
        select: episodeSelect,
        take: limit - recommendations.size,
      });
      for (const ep of directorEpisodes) {
        if (!recommendations.has(ep.id)) recommendations.set(ep.id, ep);
      }
    }

    const results = Array.from(recommendations.values()).slice(0, limit);
    return results;
  } catch (error) {
    console.error("Erreur getRecommendations:", error);
    return [];
  }
}
