import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/helpers/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL || "http://localhost:3000";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/episodes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sagas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/options`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Récupérer les épisodes
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      slug: { not: null },
    },
    include: {
      links: {
        include: {
          film: {
            select: {
              age: true,
            },
          },
        },
      },
    },
    orderBy: {
      pubDate: "desc",
    },
  });

  const episodePages = episodes
    .filter((episode) => {
      // Filtrer les épisodes avec contenu adulte
      const mainFilm = episode.links[0]?.film;
      const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";
      return !isAdult; // Ne pas inclure les épisodes adultes dans le sitemap
    })
    .map((episode) => ({
      url: `${baseUrl}/episodes/${episode.slug}`,
      lastModified: episode.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Récupérer les sagas
  const sagas = await prisma.saga.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const sagaPages = sagas.map((saga) => ({
    url: `${baseUrl}/sagas/${saga.slug}`,
    lastModified: saga.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...episodePages, ...sagaPages];
}
