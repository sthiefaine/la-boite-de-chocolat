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
      url: `${baseUrl}/films`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/episodes/top`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Récupérer les épisodes avec transcriptions
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
      transcription: {
        select: {
          id: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      pubDate: "desc",
    },
  });

  const nonAdultEpisodes = episodes.filter((episode) => {
    const mainFilm = episode.links[0]?.film;
    const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";
    return !isAdult;
  });

  const episodePages = nonAdultEpisodes.map((episode) => ({
    url: `${baseUrl}/episodes/${episode.slug}`,
    lastModified: episode.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Pages de transcription (contenu textuel riche = haute valeur SEO)
  const transcriptionPages = nonAdultEpisodes
    .filter((episode) => episode.transcription)
    .map((episode) => ({
      url: `${baseUrl}/episodes/${episode.slug}/transcription`,
      lastModified: episode.transcription!.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
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

  // Récupérer les films (hors contenu adulte)
  const films = await prisma.film.findMany({
    where: {
      NOT: {
        OR: [{ age: "18+" }, { age: "adult" }],
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const filmPages = films.map((film) => ({
    url: `${baseUrl}/films/${film.slug}`,
    lastModified: film.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Récupérer les personnes (réalisateurs, acteurs)
  const people = await prisma.person.findMany({
    where: {
      slug: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const peoplePages = people.map((person) => ({
    url: `${baseUrl}/people/${person.slug}`,
    lastModified: person.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...episodePages,
    ...transcriptionPages,
    ...sagaPages,
    ...filmPages,
    ...peoplePages,
  ];
}
