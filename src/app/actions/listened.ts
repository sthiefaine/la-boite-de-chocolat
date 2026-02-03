"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle l'état "écouté" d'un épisode pour un utilisateur
 */
export async function toggleListened(episodeId: string, userId?: string) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: { slug: true },
    });

    if (!episode) {
      return { success: false, error: "Épisode non trouvé" };
    }

    const existing = await prisma.listenedEpisode.findUnique({
      where: {
        userId_episodeId: { userId, episodeId },
      },
    });

    if (existing) {
      await prisma.listenedEpisode.delete({
        where: { id: existing.id },
      });

      revalidatePath(`/episodes/${episode.slug}`);
      return { success: true, listened: false };
    }

    await prisma.listenedEpisode.create({
      data: { userId, episodeId },
    });

    revalidatePath(`/episodes/${episode.slug}`);
    return { success: true, listened: true };
  } catch (error) {
    console.error("Erreur lors du toggle listened:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Marquer un épisode comme écouté (idempotent - pour l'auto-85%)
 */
export async function markAsListened(episodeId: string, userId?: string) {
  try {
    if (!userId) return { success: false };

    const existing = await prisma.listenedEpisode.findUnique({
      where: {
        userId_episodeId: { userId, episodeId },
      },
    });

    if (existing) return { success: true, listened: true };

    await prisma.listenedEpisode.create({
      data: { userId, episodeId },
    });

    return { success: true, listened: true };
  } catch (error) {
    console.error("Erreur lors du mark as listened:", error);
    return { success: false };
  }
}

/**
 * Vérifie si un épisode a été écouté par l'utilisateur
 */
export async function isEpisodeListened(
  episodeId: string,
  userId?: string
): Promise<boolean> {
  try {
    if (!userId) return false;

    const listened = await prisma.listenedEpisode.findUnique({
      where: {
        userId_episodeId: { userId, episodeId },
      },
    });

    return !!listened;
  } catch (error) {
    console.error("Erreur lors de la vérification listened:", error);
    return false;
  }
}

/**
 * Récupère la liste des épisodes écoutés par un utilisateur
 */
export async function getUserListenedEpisodes(userId: string) {
  try {
    const listened = await prisma.listenedEpisode.findMany({
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

    return listened;
  } catch (error) {
    console.error("Erreur lors de la récupération des listened:", error);
    return [];
  }
}
