"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function rateEpisode(
  episodeId: string,
  rating: number,
  userId?: string
) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour noter un épisode",
      };
    }

    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "La note doit être comprise entre 1 et 5",
      };
    }

    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      return {
        success: false,
        error: "Épisode non trouvé",
      };
    }

    const userRating = await prisma.rating.upsert({
      where: {
        userId_episodeId: {
          userId: userId,
          episodeId: episodeId,
        },
      },
      update: {
        rating: rating,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        episodeId: episodeId,
        rating: rating,
      },
    });

    revalidatePath(`/episodes/${episode.slug}`);

    return {
      success: true,
      rating: userRating,
    };
  } catch (error) {
    console.error("Erreur lors de la notation de l'épisode:", error);
    return {
      success: false,
      error: "Erreur lors de la notation de l'épisode",
    };
  }
}

export async function getUserRating(episodeId: string, userId?: string) {
  try {
    if (!userId) {
      return null;
    }

    const rating = await prisma.rating.findUnique({
      where: {
        userId_episodeId: {
          userId: userId,
          episodeId: episodeId,
        },
      },
    });

    return rating?.rating || null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la note utilisateur:",
      error
    );
    return null;
  }
}

export async function getEpisodeRatingStats(episodeId: string) {
  try {
    const ratings = await prisma.rating.findMany({
      where: { episodeId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / totalRatings) * 10) / 10;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      averageRating,
      totalRatings,
      ratingDistribution: distribution,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques de notation:",
      error
    );
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

export async function deleteUserRating(episodeId: string, userId?: string) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour supprimer votre note",
      };
    }

    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: { slug: true },
    });

    if (!episode) {
      return {
        success: false,
        error: "Épisode non trouvé",
      };
    }

    await prisma.rating.deleteMany({
      where: {
        userId: userId,
        episodeId: episodeId,
      },
    });

    revalidatePath(`/episodes/${episode.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la note",
    };
  }
}
