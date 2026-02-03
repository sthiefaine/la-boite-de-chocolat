"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle le favori d'un épisode pour un utilisateur
 * Si le favori existe, le supprime. Sinon, le crée.
 */
export async function toggleFavorite(episodeId: string, userId?: string) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour ajouter un favori",
      };
    }

    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: { slug: true },
    });

    if (!episode) {
      return { success: false, error: "Épisode non trouvé" };
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_episodeId: { userId, episodeId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });

      revalidatePath(`/episodes/${episode.slug}`);

      return { success: true, favorited: false };
    }

    await prisma.favorite.create({
      data: { userId, episodeId },
    });

    revalidatePath(`/episodes/${episode.slug}`);

    return { success: true, favorited: true };
  } catch (error) {
    console.error("Erreur lors du toggle favori:", error);
    return { success: false, error: "Erreur lors de la mise à jour du favori" };
  }
}

/**
 * Vérifie si un épisode est dans les favoris de l'utilisateur
 */
export async function isEpisodeFavorited(
  episodeId: string,
  userId?: string
): Promise<boolean> {
  try {
    if (!userId) return false;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_episodeId: { userId, episodeId },
      },
    });

    return !!favorite;
  } catch (error) {
    console.error("Erreur lors de la vérification du favori:", error);
    return false;
  }
}

/**
 * Récupère la liste des favoris d'un utilisateur avec les données des épisodes et films
 */
export async function getUserFavorites(userId: string) {
  try {
    const favorites = await prisma.favorite.findMany({
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
            age: true,
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
                    director: true,
                    saga: {
                      select: {
                        name: true,
                        id: true,
                      },
                    },
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}
