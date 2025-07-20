"use server";

import { prisma } from "@/lib/prisma";
import { getUploadServerUrl } from "@/helpers/imageConfig";

export interface PodcastImage {
  id: string;
  title: string;
  imgFileName: string | null;
  pubDate: Date;
  slug: string | null;
  links: Array<{
    film: {
      id: string;
      title: string;
      imgFileName: string | null;
      age: string | null;
    } | null;
  }>;
}

/**
 * Récupère les images des 40 dernières émissions de podcasts
 * @returns Array des images des épisodes avec leurs films liés
 */
export async function getLatestPodcastImages(): Promise<PodcastImage[]> {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
        links: {
          every: {
            film: {
              age: {
                notIn: ["18+", "adult"],
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        imgFileName: true,
        pubDate: true,
        slug: true,
        links: {
          select: {
            film: {
              select: {
                id: true,
                title: true,
                imgFileName: true,
                age: true,
              },
            },
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
      take: 40,
    });

    return episodes;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des images de podcasts:",
      error
    );
    return [];
  }
}

/**
 * Récupère les images des épisodes d'un podcast spécifique
 * @param rssFeedNameId - L'identifiant du flux RSS
 * @param limit - Nombre d'épisodes à récupérer (défaut: 40)
 * @returns Array des images des épisodes
 */
export async function getPodcastImagesByFeed(
  rssFeedNameId: string = "la-boite-de-chocolat",
  limit: number = 40
): Promise<PodcastImage[]> {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeed: {
          nameId: rssFeedNameId,
        },
        links: {
          every: {
            film: {
              age: {
                notIn: ["18+", "adult"],
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        imgFileName: true,
        pubDate: true,
        slug: true,
        links: {
          select: {
            film: {
              select: {
                id: true,
                title: true,
                imgFileName: true,
                age: true,
              },
            },
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
      take: limit,
    });

    return episodes;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des images de podcasts:",
      error
    );
    return [];
  }
}

/**
 * Récupère les URLs complètes des images des épisodes
 * @param episodes - Array des épisodes avec leurs films liés
 * @returns Array des URLs complètes des images
 */
export async function getPodcastImageUrls(
  episodes: PodcastImage[]
): Promise<string[]> {
  return episodes
    .flatMap((episode) => {
      const mainFilm = episode.links[0]?.film;
      if (mainFilm?.imgFileName) {
        const isAdult = mainFilm.age === "18+" || mainFilm.age === "adult";
        if (isAdult) {
          return [
            `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/api/image/masked/${mainFilm.imgFileName}`,
          ];
        }

        return [getUploadServerUrl(mainFilm.imgFileName, "films")];
      }

      if (episode.imgFileName) {
        if (episode.imgFileName.startsWith("/")) {
          return [
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${
              episode.imgFileName
            }`,
          ];
        }

        if (episode.imgFileName.startsWith("http")) {
          return [episode.imgFileName];
        }

        return [getUploadServerUrl(episode.imgFileName)];
      }

      return [];
    })
    .filter(Boolean);
}
