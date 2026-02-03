"use server";

import { prisma } from "@/lib/prisma";

const episodeWithFilmSelect = {
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

export async function getTopRatedEpisodes(limit = 10) {
  try {
    const topRated = await prisma.rating.groupBy({
      by: ["episodeId"],
      _avg: { rating: true },
      _count: { rating: true },
      having: { rating: { _count: { gte: 2 } } },
      orderBy: { _avg: { rating: "desc" } },
      take: limit,
    });

    const episodeIds = topRated.map((r) => r.episodeId);
    const episodes = await prisma.podcastEpisode.findMany({
      where: { id: { in: episodeIds } },
      select: episodeWithFilmSelect,
    });

    const episodeMap = new Map(episodes.map((e) => [e.id, e]));

    return topRated.map((r) => ({
      episode: episodeMap.get(r.episodeId)!,
      avgRating: Math.round((r._avg.rating || 0) * 10) / 10,
      ratingCount: r._count.rating,
    })).filter((r) => r.episode);
  } catch (error) {
    console.error("Erreur getTopRatedEpisodes:", error);
    return [];
  }
}

export async function getMostListenedEpisodes(limit = 10) {
  try {
    const topListened = await prisma.listenedEpisode.groupBy({
      by: ["episodeId"],
      _count: { episodeId: true },
      orderBy: { _count: { episodeId: "desc" } },
      take: limit,
    });

    const episodeIds = topListened.map((r) => r.episodeId);
    const episodes = await prisma.podcastEpisode.findMany({
      where: { id: { in: episodeIds } },
      select: episodeWithFilmSelect,
    });

    const episodeMap = new Map(episodes.map((e) => [e.id, e]));

    return topListened.map((r) => ({
      episode: episodeMap.get(r.episodeId)!,
      listenedCount: r._count.episodeId,
    })).filter((r) => r.episode);
  } catch (error) {
    console.error("Erreur getMostListenedEpisodes:", error);
    return [];
  }
}

export async function getMostFavoritedEpisodes(limit = 10) {
  try {
    const topFavorited = await prisma.favorite.groupBy({
      by: ["episodeId"],
      _count: { episodeId: true },
      orderBy: { _count: { episodeId: "desc" } },
      take: limit,
    });

    const episodeIds = topFavorited.map((r) => r.episodeId);
    const episodes = await prisma.podcastEpisode.findMany({
      where: { id: { in: episodeIds } },
      select: episodeWithFilmSelect,
    });

    const episodeMap = new Map(episodes.map((e) => [e.id, e]));

    return topFavorited.map((r) => ({
      episode: episodeMap.get(r.episodeId)!,
      favoriteCount: r._count.episodeId,
    })).filter((r) => r.episode);
  } catch (error) {
    console.error("Erreur getMostFavoritedEpisodes:", error);
    return [];
  }
}
