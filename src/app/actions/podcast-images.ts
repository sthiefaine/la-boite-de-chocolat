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
  const seen = new Set<string>();

  return episodes
    .flatMap((episode) => {
      const urls: string[] = [];

      // Collecter les images de TOUS les films lies (pas seulement le premier)
      for (const link of episode.links) {
        const film = link.film;
        if (film?.imgFileName && !seen.has(film.imgFileName)) {
          seen.add(film.imgFileName);
          const isAdult = film.age === "18+" || film.age === "adult";
          if (isAdult) {
            urls.push(
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/api/image/masked/${film.imgFileName}`
            );
          } else {
            urls.push(getUploadServerUrl(film.imgFileName, "films"));
          }
        }
      }

      // Fallback : image de l'episode si aucun film n'a d'image
      if (urls.length === 0 && episode.imgFileName) {
        if (!seen.has(episode.imgFileName)) {
          seen.add(episode.imgFileName);
          if (episode.imgFileName.startsWith("/")) {
            urls.push(
              `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${
                episode.imgFileName
              }`
            );
          } else if (episode.imgFileName.startsWith("http")) {
            urls.push(episode.imgFileName);
          } else {
            urls.push(getUploadServerUrl(episode.imgFileName));
          }
        }
      }

      return urls;
    })
    .filter(Boolean);
}
