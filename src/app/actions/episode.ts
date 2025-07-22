"use server";

import { cache } from "react";
import { PODCAST_CATEGORIES } from "@/helpers/helpers";
import { prisma } from "@/lib/prisma";
import { uploadPodcastFile } from "@/helpers/uploadHelpers";
import { getMaskedImageUrl } from "@/app/actions/image";
import { getUploadServerUrl } from "@/helpers/imageConfig";

export async function getEpisodeBySlug(slug: string) {
  try {
    const episode = await prisma.podcastEpisode.findUnique({
      where: { slug },
      include: {
        links: {
          include: {
            film: {
              select: {
                id: true,
                title: true,
                imgFileName: true,
                age: true,
                director: true,
                year: true,
                tmdbId: true,
                saga: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    imgFileName: true,
                    films: {
                      select: {
                        id: true,
                        title: true,
                        year: true,
                        slug: true,
                        imgFileName: true,
                        age: true,
                        director: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!episode) {
      return null;
    }

    const mainFilm = episode.links[0]?.film;
    const isAdultContent = mainFilm?.age === "18+" || mainFilm?.age === "adult";

    const mainFilmImageUrl = isAdultContent
      ? await getMaskedImageUrl(
          mainFilm?.imgFileName || null,
          mainFilm?.age || null
        )
      : mainFilm?.imgFileName
      ? getUploadServerUrl(mainFilm.imgFileName)
      : "/images/navet.png";

    /*
      film: "https://XXXXXXXXXXXX.public.blob.vercel-storage.com/films/poster_twilight__chapitre_5___r_v_lation__2_me_partie_1752071582681-wGjg6p2A2dFq3uZoR5byWPYcgpsbZp.jpg"
      adult: "/api/image/masked/poster_la_cambrioleuse_1752279342328-QhbXwke7cFBWoDjZB9EuhGjDmh8jzX.jpg"
      navet: "/images/navet.png"
*/

    return {
      episode,
      mainFilm,
      saga: mainFilm?.saga || null,
      isAdultContent,
      mainFilmImageUrl,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'épisode:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de l'épisode",
    };
  }
}

// Version cache pour éviter les requêtes en double entre metadata et page
export const getEpisodeBySlugCached = cache(async (slug: string) => {
  try {
    const episode = await prisma.podcastEpisode.findUnique({
      where: { slug },
      include: {
        links: {
          include: {
            film: {
              select: {
                id: true,
                title: true,
                imgFileName: true,
                age: true,
                director: true,
                year: true,
                tmdbId: true,
                saga: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    imgFileName: true,
                    slug: true,
                    films: {
                      select: {
                        id: true,
                        title: true,
                        year: true,
                        slug: true,
                        imgFileName: true,
                        age: true,
                        director: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        transcription: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!episode) {
      return null;
    }

    const mainFilm = episode.links[0]?.film;
    const isAdultContent = mainFilm?.age === "18+" || mainFilm?.age === "adult";

    const mainFilmImageUrl = isAdultContent
      ? await getMaskedImageUrl(
          mainFilm?.imgFileName || null,
          mainFilm?.age || null
        )
      : mainFilm?.imgFileName
      ? getUploadServerUrl(mainFilm.imgFileName)
      : "/images/navet.png";

    /*
      film: "https://XXXXXXXXXXXX.public.blob.vercel-storage.com/films/poster_twilight__chapitre_5___r_v_lation__2_me_partie_1752071582681-wGjg6p2A2dFq3uZoR5byWPYcgpsbZp.jpg"
      adult: "/api/image/masked/poster_la_cambrioleuse_1752279342328-QhbXwke7cFBWoDjZB9EuhGjDmh8jzX.jpg"
      navet: "/images/navet.png"
*/

    return {
      episode,
      mainFilm,
      saga: mainFilm?.saga || null,
      isAdultContent,
      mainFilmImageUrl,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'épisode (cache):",
      error
    );
    return null;
  }
});

export async function getPreviousEpisode(slug: string) {
  try {
    // D'abord, récupérer l'épisode actuel pour obtenir sa date
    const currentEpisode = await prisma.podcastEpisode.findUnique({
      where: { slug },
      select: { pubDate: true },
    });

    if (!currentEpisode) return null;

    // Récupérer l'épisode précédent (plus ancien)
    const previousEpisode = await prisma.podcastEpisode.findFirst({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
        pubDate: {
          lt: currentEpisode.pubDate,
        },
      },
      include: {
        links: {
          include: {
            film: {
              include: {
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
      },
      orderBy: {
        pubDate: "desc",
      },
    });

    return previousEpisode;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'épisode précédent:",
      error
    );
    return null;
  }
}

export async function getNextEpisode(slug: string) {
  try {
    const currentEpisode = await prisma.podcastEpisode.findUnique({
      where: { slug },
      select: { pubDate: true },
    });

    if (!currentEpisode) return null;

    const nextEpisode = await prisma.podcastEpisode.findFirst({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
        pubDate: {
          gt: currentEpisode.pubDate,
        },
      },
      include: {
        links: {
          include: {
            film: {
              include: {
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
      },
      orderBy: {
        pubDate: "asc",
      },
    });

    return nextEpisode;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'épisode suivant:",
      error
    );
    return null;
  }
}

export async function getEpisodeNavigation(slug: string) {
  try {
    const [previousEpisode, nextEpisode] = await Promise.all([
      getPreviousEpisode(slug),
      getNextEpisode(slug),
    ]);

    return {
      success: true,
      data: {
        previousEpisode,
        nextEpisode,
      },
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
      },
      select: {
        id: true,
        title: true,
        description: true,
        pubDate: true,
        audioUrl: true,
        duration: true,
        slug: true,
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
                saga: {
                  select: {
                    id: true,
                    name: true,
                    imgFileName: true,
                    slug: true,
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

    const episodesWithCategories = episodes.map((episode) => {
      const category = Object.keys(PODCAST_CATEGORIES).find((categoryKey) => {
        const categoryInfo =
          PODCAST_CATEGORIES[categoryKey as keyof typeof PODCAST_CATEGORIES];
        return episode.links.some((link) => {
          const sagaName = link?.film?.saga?.name;
          return (
            sagaName &&
            categoryInfo.sagaNames.some((sagaNameFromCategory) =>
              sagaName
                .toLowerCase()
                .includes(sagaNameFromCategory.toLowerCase())
            )
          );
        });
      });

      const parentSaga = category
        ? PODCAST_CATEGORIES[category as keyof typeof PODCAST_CATEGORIES]
        : null;

      return {
        ...episode,
        parentSaga: parentSaga
          ? {
              id: parentSaga.id,
              name: parentSaga.name,
              icon: parentSaga.icon,
              color: parentSaga.color,
            }
          : null,
      };
    });

    return { success: true, data: episodesWithCategories };
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
        slug: true,
        season: true,
        episode: true,
        links: {
          select: {
            id: true,
            film: {
              select: {
                id: true,
                slug: true,
                title: true,
                year: true,
                imgFileName: true,
                age: true,
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

export async function getRandomEpisode() {
  try {
    const totalEpisodes = await prisma.podcastEpisode.count({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
      },
    });

    if (totalEpisodes === 0) {
      return { success: false, error: "Aucun épisode trouvé" };
    }

    const randomOffset = Math.floor(Math.random() * totalEpisodes);

    const randomEpisode = await prisma.podcastEpisode.findFirst({
      where: {
        rssFeed: {
          nameId: "la-boite-de-chocolat",
        },
      },
      orderBy: {
        pubDate: "desc",
      },
      skip: randomOffset,
      select: {
        id: true,
        title: true,
        slug: true,
        audioUrl: true,
        links: {
          select: {
            film: {
              select: {
                imgFileName: true,
              },
            },
          },
        },
      },
    });

    if (!randomEpisode) {
      return {
        success: false,
        error: "Erreur lors de la récupération de l'épisode aléatoire",
      };
    }

    return { success: true, data: randomEpisode };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'épisode aléatoire:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération de l'épisode aléatoire",
    };
  }
}

export async function getAllPodcasts() {
  try {
    const podcasts = await prisma.rssFeed.findMany({
      select: {
        id: true,
        name: true,
        nameId: true,
        url: true,
        episodes: {
          select: {
            id: true,
            title: true,
            pubDate: true,
            duration: true,
            slug: true,
            _count: {
              select: {
                links: true,
              },
            },
          },
          orderBy: {
            pubDate: "desc",
          },
          take: 1, // Dernier épisode seulement
        },
        _count: {
          select: {
            episodes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: podcasts };
  } catch (error) {
    console.error("Erreur lors de la récupération des podcasts:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des podcasts",
    };
  }
}

export async function updateEpisode(
  episodeId: string,
  data: {
    title: string;
    description: string;
    genre: string | null;
    imgFileName: string | null;
    age: string | null;
  }
) {
  try {
    const updatedEpisode = await prisma.podcastEpisode.update({
      where: { id: episodeId },
      data: {
        title: data.title,
        description: data.description,
        genre: data.genre,
        imgFileName: data.imgFileName,
        age: data.age,
      },
    });

    return { success: true, data: updatedEpisode };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'épisode:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'épisode",
    };
  }
}

export async function deleteEpisodeLink(linkId: string) {
  try {
    await prisma.podcastFilmLink.delete({
      where: { id: linkId },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du lien:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du lien",
    };
  }
}

export async function uploadPodcastPoster(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "Aucun fichier fourni",
      };
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Le fichier doit être une image",
      };
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Le fichier est trop volumineux (max 5MB)",
      };
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `episode-${timestamp}.${extension}`;

    // Upload vers le serveur
    const result = await uploadPodcastFile(file, fileName);

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          fileName: result.data.fileName,
          url: result.data.url,
        },
      };
    } else {
      return {
        success: false,
        error: result.error || "Erreur lors de l'upload du poster",
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'upload du poster:", error);
    return {
      success: false,
      error: "Erreur lors de l'upload du poster",
    };
  }
}
