import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getMaskedImageUrl } from "@/app/actions/image";

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params;

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
            },
          },
        },
      },
    },
  });

  if (!episode) {
    return {
      title: "Épisode non trouvé",
    };
  }

  const mainFilm = episode.links[0]?.film;
  const title = mainFilm?.title || episode.title;

  const ogImageUrl = await getMaskedImageUrl(mainFilm?.imgFileName || null, mainFilm?.age || null);
  const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  return {
    title: `${title} - La Boîte de Chocolat`,
    description:
      episode.description?.substring(0, 160) ||
      `Écoutez l'épisode sur ${title}`,
    openGraph: {
      title: `${title} - La Boîte de Chocolat`,
      description:
        episode.description?.substring(0, 160) ||
        `Écoutez l'épisode sur ${title}`,
      type: "article",
      publishedTime: episode.pubDate.toISOString(),
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 500,
              height: 750,
              alt: isAdult ? "Poster flouté - contenu 18+" : `Poster de ${mainFilm?.title}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - La Boîte de Chocolat`,
      description:
        episode.description?.substring(0, 160) ||
        `Écoutez l'épisode sur ${title}`,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
