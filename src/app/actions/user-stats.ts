"use server";

import { prisma } from "@/lib/prisma";

export async function getUserProfileStats(userId: string) {
  try {
    const [favoriteCount, listenedCount, ratingStats, recentFavorites, recentListened, recentRatings] =
      await Promise.all([
        prisma.favorite.count({ where: { userId } }),
        prisma.listenedEpisode.count({ where: { userId } }),
        prisma.rating.aggregate({
          where: { userId },
          _count: true,
          _avg: { rating: true },
        }),
        prisma.favorite.findMany({
          where: { userId },
          include: {
            episode: {
              select: {
                id: true,
                title: true,
                slug: true,
                pubDate: true,
                duration: true,
                genre: true,
                imgFileName: true,
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
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.listenedEpisode.findMany({
          where: { userId },
          include: {
            episode: {
              select: {
                id: true,
                title: true,
                slug: true,
                pubDate: true,
                duration: true,
                genre: true,
                imgFileName: true,
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
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.rating.findMany({
          where: { userId },
          select: {
            id: true,
            rating: true,
            episode: {
              select: {
                id: true,
                title: true,
                slug: true,
                pubDate: true,
                duration: true,
                genre: true,
                imgFileName: true,
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
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
      ]);

    return {
      success: true,
      data: {
        favoriteCount,
        listenedCount,
        ratingCount: ratingStats._count,
        averageRating: ratingStats._avg.rating
          ? Math.round(ratingStats._avg.rating * 10) / 10
          : null,
        recentFavorites,
        recentListened,
        recentRatings,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return {
      success: false,
      data: {
        favoriteCount: 0,
        listenedCount: 0,
        ratingCount: 0,
        averageRating: null,
        recentFavorites: [],
        recentListened: [],
        recentRatings: [],
      },
    };
  }
}
