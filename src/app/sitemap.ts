import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

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
  ];

  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      slug: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      pubDate: "desc",
    },
  });

  const episodePages = episodes.map((episode) => ({
    url: `${baseUrl}/episodes/${episode.slug}`,
    lastModified: episode.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));



  return [...staticPages, ...episodePages,];
}
