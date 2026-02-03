"use server";

import { revalidatePath } from "next/cache";
import { prisma } from '@/lib/prisma';

export async function getAdminStats() {
  try {
    const [episodesCount, filmsCount, linksCount, sagasCount] = await Promise.all([
      prisma.podcastEpisode.count(),
      prisma.film.count(),
      prisma.podcastFilmLink.count(),
      prisma.saga.count()
    ]);

    return {
      episodes: episodesCount,
      films: filmsCount,
      links: linksCount,
      sagas: sagasCount
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return {
      episodes: 0,
      films: 0,
      links: 0,
      sagas: 0
    };
  }
}

export async function getLatestEpisodes(limit = 5) {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      take: limit,
      orderBy: {
        pubDate: 'desc'
      },
      include: {
        links: {
          include: {
            film: true
          }
        }
      }
    });

    return episodes;
  } catch (error) {
    console.error('Erreur lors de la récupération des épisodes:', error);
    return [];
  }
}

export async function getRecentFilms(limit = 5) {
  try {
    const films = await prisma.film.findMany({
      take: limit,
      orderBy: {
        id: 'desc'
      },
      include: {
        links: {
          include: {
            podcast: true
          }
        }
      }
    });

    return films;
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    return [];
  }
}

export async function deleteEpisode(episodeId: string) {
  try {
    // Supprimer d'abord les liens avec les films
    await prisma.podcastFilmLink.deleteMany({
      where: {
        podcastId: episodeId
      }
    });

    // Puis supprimer l'épisode
    const deleted = await prisma.podcastEpisode.delete({
      where: {
        id: episodeId
      },
      select: { slug: true },
    });

    revalidatePath(`/episodes/${deleted.slug}`);
    revalidatePath("/episodes");
    revalidatePath("/episodes/budget");
    revalidatePath("/episodes/sagas");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'épisode:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
} 