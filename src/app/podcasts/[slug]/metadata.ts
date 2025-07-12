import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getMaskedImageUrl } from "@/app/actions/image";
import { SITE_URL } from "@/lib/config";

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
              director: true,
              year: true,
            },
          },
        },
      },
    },
  });

  if (!episode) {
    return {
      title: "Épisode non trouvé - La Boîte de Chocolat",
      description:
        "Cet épisode de podcast n'existe pas ou n'est plus disponible.",
      robots: "noindex, nofollow",
    };
  }

  const mainFilm = episode.links[0]?.film;
  const title = mainFilm?.title || episode.title;
  const season = episode.season || null;
  const episodeNumber = episode.episode || null;
  const fullTitle = `#${season}x${episodeNumber} - ${title} - La Boîte de Chocolat`;

  // Description enrichie
  let description = episode.description?.substring(0, 160);
  if (!description && mainFilm) {
    description = `Découvrez notre analyse du film ${mainFilm.title}`;
    if (mainFilm.director) description += ` de ${mainFilm.director}`;
    if (mainFilm.year) description += ` (${mainFilm.year})`;
    description += " dans ce nouvel épisode de La Boîte de Chocolat.";
  }
  description = description || `Écoutez l'épisode sur ${title}`;

  const ogImageUrl = await getMaskedImageUrl(
    mainFilm?.imgFileName || null,
    mainFilm?.age || null
  );
  const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  // URL canonique
  const canonicalUrl = `${SITE_URL}/podcast/${slug}`;

  // Mots-clés basés sur le contenu
  const keywords = [
    "podcast",
    "cinéma",
    "film",
    "critique",
    "La Boîte de Chocolat",
    mainFilm?.title,
    mainFilm?.director,
    mainFilm?.year?.toString(),
  ].filter(Boolean);

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "La Boîte de Chocolat" }],
    creator: "La Boîte de Chocolat",
    publisher: "La Boîte de Chocolat",

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Métadonnées pour les robots
    robots: {
      index: !isAdult, // Ne pas indexer le contenu adulte
      follow: true,
      googleBot: {
        index: !isAdult,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Open Graph enrichi
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      publishedTime: episode.pubDate.toISOString(),
      modifiedTime: episode.updatedAt?.toISOString(),
      authors: ["La Boîte de Chocolat"],
      section: "Podcast",
      tags: keywords.filter(Boolean) as string[],
      locale: "fr_FR",
      siteName: "La Boîte de Chocolat",
      url: canonicalUrl,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 500,
              height: 750,
              alt: isAdult
                ? "Poster flouté - contenu 18+"
                : `Poster de ${mainFilm?.title}`,
              type: "image/jpeg",
            },
          ]
        : [
            {
              url: `${SITE_URL}/images/navet.png`,
              width: 1200,
              height: 630,
              alt: "La Boîte de Chocolat - Podcast Cinéma",
              type: "image/jpeg",
            },
          ],
    },

    /*     // Twitter Card enrichi
    twitter: {
      card: "summary_large_image",
      site: "@VotreCompteTwitter",
      creator: "@VotreCompteTwitter",
      title: fullTitle,
      description,
      images: ogImageUrl ? [ogImageUrl] : [`${SITE_URL}/images/navet.png`],
    }, */

    // Twitter Card enrichi
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImageUrl ? [ogImageUrl] : [`${SITE_URL}/images/navet.png`],
    },

    // Métadonnées pour les podcasts
    other: {
      // Données structurées pour les podcasts
      "podcast:author": "La Boîte de Chocolat",
      "podcast:episode": episodeNumber?.toString() || "0",
      "podcast:duration": episode.duration?.toString() || "",
      "podcast:explicit": isAdult ? "true" : "false",

      // Métadonnées additionnelles
      "article:published_time": episode.pubDate.toISOString(),
      "article:modified_time": episode.updatedAt?.toISOString(),
      "article:author": "La Boîte de Chocolat",
      "article:section": "Podcast",
      "article:tag": keywords.join(","),

      // Dublin Core
      "DC.title": fullTitle,
      "DC.creator": "La Boîte de Chocolat",
      "DC.description": description,
      "DC.date": episode.pubDate.toISOString(),
      "DC.language": "fr-FR",
      "DC.type": "Audio",
      "DC.format": "audio/mpeg",

      // Métadonnées pour le référencement local (si applicable)
      "geo.region": "FR",
      "geo.placename": "France",

      // Métadonnées de contenu
      "content-language": "fr-FR",
      "content-type": "audio/podcast",

    },

    // Métadonnées pour les applications
    applicationName: "La Boîte de Chocolat",

    // Métadonnées pour les appareils mobiles
    viewport: "width=device-width, initial-scale=1",

    // Métadonnées pour les favicons et manifestes
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          url: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  };
}
