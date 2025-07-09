"use server";

import { prisma } from "@/lib/prisma";

export async function getEpisodeBySlug(slug: string) {
  try {
    const episode = await prisma.podcastEpisode.findUnique({
      where: { slug },
      include: {
        links: {
          include: {
            film: {
              include: {
                saga: true,
              },
            },
          },
        },
        rssFeed: true,
      },
    });

    return { success: true, data: episode };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'épisode:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'épisode",
    };
  }
}

export async function getEpisodeNavigation(
  currentSlug: string,
  currentPubDate: Date
) {
  try {
    const [previousEpisode, nextEpisode] = await Promise.all([
      prisma.podcastEpisode.findFirst({
        where: {
          rssFeed: {
            nameId: "la-boite-de-chocolat",
          },
          pubDate: {
            lt: currentPubDate,
          },
        },
        include: {
          links: {
            include: {
              film: {
                include: {
                  saga: true,
                },
              },
            },
          },
        },
        orderBy: {
          pubDate: "desc",
        },
      }),
      prisma.podcastEpisode.findFirst({
        where: {
          rssFeed: {
            nameId: "la-boite-de-chocolat",
          },
          pubDate: {
            gt: currentPubDate,
          },
        },
        include: {
          links: {
            include: {
              film: {
                include: {
                  saga: true,
                },
              },
            },
          },
        },
        orderBy: {
          pubDate: "asc",
        },
      }),
    ]);

    return {
      success: true,
      data: { previousEpisode, nextEpisode },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la navigation:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la navigation",
    };
  }
}

export async function getAllEpisodeSlugs() {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
      },
      select: {
        slug: true,
      },
    });

    return { success: true, data: episodes };
  } catch (error) {
    console.error("Erreur lors de la récupération des slugs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des slugs",
    };
  }
}

export async function getEpisodesWithFilms() {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
        links: {
          some: {},
        },
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
                    name: true,
                  },
                },
              },
            },
          },
        },
        rssFeed: {
          select: {
            id: true,
            name: true,
            nameId: true,
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
    });

    return { success: true, data: episodes };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des épisodes avec films:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des épisodes",
    };
  }
}

export async function getLatestEpisode() {
  try {
    const latestEpisode = await prisma.podcastEpisode.findFirst({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
      },
      orderBy: {
        pubDate: "desc",
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
              },
            },
          },
        },
      },
    });

    if (!latestEpisode) {
      return { success: false, error: "Aucun épisode trouvé" };
    }

    return { success: true, data: latestEpisode };
  } catch (error) {
    console.error("Erreur lors de la récupération du dernier épisode:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du dernier épisode",
    };
  }
}

export async function linkEpisodeToFilm(episodeId: string, filmId: string) {
  try {
    const existingLink = await prisma.podcastFilmLink.findFirst({
      where: {
        podcastId: episodeId,
        filmId,
      },
    });

    if (existingLink) {
      return { success: false, error: "Ce lien existe déjà" };
    }

    await prisma.podcastFilmLink.create({
      data: {
        podcastId: episodeId,
        filmId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la liaison épisode-film:", error);
    return { success: false, error: "Erreur lors de la liaison épisode-film" };
  }
}

export async function unlinkEpisodeFromFilm(episodeId: string, filmId: string) {
  try {
    await prisma.podcastFilmLink.deleteMany({
      where: {
        podcastId: episodeId,
        filmId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du lien épisode-film:", error);
    return { success: false, error: "Erreur lors de la suppression du lien" };
  }
}
