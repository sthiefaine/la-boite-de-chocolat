'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function linkEpisodeToFilm(episodeId: string, filmId: string) {
  try {
    // Vérifier que l'épisode existe
    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      include: { rssFeed: true }
    });

    if (!episode) {
      throw new Error('Épisode non trouvé');
    }

    // Vérifier que le film existe
    const film = await prisma.film.findUnique({
      where: { id: filmId }
    });

    if (!film) {
      throw new Error('Film non trouvé');
    }

    // Vérifier si le lien existe déjà
    const existingLink = await prisma.podcastFilmLink.findFirst({
      where: {
        podcastId: episodeId,
        filmId: filmId
      }
    });

    if (existingLink) {
      throw new Error('Ce lien existe déjà');
    }

    // Créer le lien
    await prisma.podcastFilmLink.create({
      data: {
        podcastId: episodeId,
        filmId: filmId
      }
    });

    // Revalider la page
    revalidatePath(`/admin/episode/${episodeId}/edit`);
    revalidatePath(`/admin/list/podcast/${episode.rssFeed.nameId}`);

    return { success: true, message: 'Film lié avec succès' };

  } catch (error) {
    console.error('Erreur lors de la liaison:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    };
  }
}

export async function unlinkEpisodeFromFilm(episodeId: string, filmId: string) {
  try {
    // Vérifier que l'épisode existe
    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      include: { rssFeed: true }
    });

    if (!episode) {
      throw new Error('Épisode non trouvé');
    }

    // Vérifier que le film existe
    const film = await prisma.film.findUnique({
      where: { id: filmId }
    });

    if (!film) {
      throw new Error('Film non trouvé');
    }

    // Supprimer le lien
    const deletedLink = await prisma.podcastFilmLink.deleteMany({
      where: {
        podcastId: episodeId,
        filmId: filmId
      }
    });

    if (deletedLink.count === 0) {
      throw new Error('Lien non trouvé');
    }

    // Revalider la page
    revalidatePath(`/admin/episode/${episodeId}/edit`);
    revalidatePath(`/admin/list/podcast/${episode.rssFeed.nameId}`);

    return { success: true, message: 'Lien supprimé avec succès' };

  } catch (error) {
    console.error('Erreur lors de la suppression du lien:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    };
  }
} 

export async function getEpisodesWithFilms() {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeed: {
          nameId: 'la-boite-de-chocolat'
        },
        links: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        pubDate: true,
        audioUrl: true,
        duration: true,
        slug: true,
        links: {
          select: {
            film: {
              select: {
                id: true,
                title: true,
                slug: true,
                year: true,
                imgFileName: true,
                saga: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        rssFeed: {
          select: {
            id: true,
            name: true,
            nameId: true
          }
        }
      },
      orderBy: {
        pubDate: 'desc'
      },
    });

    return { success: true, data: episodes };
  } catch (error) {
    console.error('Erreur lors de la récupération des épisodes avec films:', error);
    return { success: false, error: 'Erreur lors de la récupération des épisodes' };
  }
} 

export async function getLatestEpisode() {
  try {
    const latestEpisode = await prisma.podcastEpisode.findFirst({
      where: {
        rssFeed: {
          nameId: 'la-boite-de-chocolat'
        }
      },
      orderBy: {
        pubDate: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        pubDate: true,
        audioUrl: true,
        duration: true,
        links: {
          select: {
            id: true,
            film: {
              select: {
                id: true,
                title: true,
                year: true,
              }
            }
          }
        }
      }
    });

    if (!latestEpisode) {
      return { success: false, error: 'Aucun épisode trouvé' };
    }

    return { success: true, data: latestEpisode };
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier épisode:', error);
    return { success: false, error: 'Erreur lors de la récupération du dernier épisode' };
  }
} 