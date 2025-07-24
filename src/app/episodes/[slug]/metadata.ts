import { Metadata, Viewport } from "next";
import { SITE_URL } from "@/helpers/config";
import { getEpisodeBySlugCached } from "@/app/actions/episode";

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params;

  const episodeData = await getEpisodeBySlugCached(slug);

  if (!episodeData) {
    return {
      title: "Épisode non trouvé - La Boîte de Chocolat",
      description:
        "Cet épisode de podcast n'existe pas ou n'est plus disponible.",
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
      alternates: {
        canonical: `${SITE_URL}/episodes/${slug}`,
      },
    };
  }

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? SITE_URL
      : SITE_URL || "http://localhost:3000";

  const { episode, mainFilm, isAdultContent } = episodeData;
  const title = mainFilm?.title || episode.title;
  const season = episode.season || null;
  const episodeNumber = episode.episode || null;
  const episodeNumberText = episodeNumber ? `E${episodeNumber}` : "";
  const fullTitle = `S${season} ${episodeNumberText} - ${title} - La Boîte de Chocolat`;

  // Description enrichie
  let description = "";
  if (!description && mainFilm) {
    description = `Découvrez notre analyse du film ${mainFilm.title}`;
    if (mainFilm.director) description += ` de ${mainFilm.director}`;
    if (mainFilm.year) description += ` (${mainFilm.year})`;
    description += " dans ce nouvel épisode de La Boîte de Chocolat.";
  }
  description = description || `Écoutez l'épisode sur ${title}`;
  const isAdult = isAdultContent;

  const ogImageUrl = slug
    ? `/episodes/${slug}/opengraph-image`
    : "/opengraph-image";
  const twitterImageUrl = slug
    ? `/episodes/${slug}/twitter-image`
    : "/twitter-image";

  // URL canonique
  const canonicalUrl = `${SITE_URL}/episodes/${slug}`;

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
    metadataBase: new URL(baseUrl),
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
        noarchive: isAdult,
        nosnippet: isAdult,
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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: isAdult
            ? "Poster flouté - contenu 18+"
            : `Poster de ${mainFilm?.title}`,
          type: "image/png",
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
      images: [twitterImageUrl],
    },

    // Métadonnées pour les podcasts
    other: {
      // Données structurées pour les podcasts
      "podcast:author": "La Boîte de Chocolat",
      "podcast:season": season?.toString() || "",
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

      // Métadonnées pour l'indexation
      googlebot: "index, follow",
      bingbot: "index, follow",
      slurp: "index, follow",

      // Métadonnées pour les réseaux sociaux
      "twitter:card": "summary_large_image",
      "twitter:site": "@LaBoiteDeChocolat",
      "twitter:creator": "@LaBoiteDeChocolat",

      "og:site_name": "La Boîte de Chocolat",
      "og:locale": "fr_FR",
      "og:type": "article",
    },

    // Métadonnées pour les applications
    applicationName: "La Boîte de Chocolat",

    // Métadonnées supplémentaires pour l'indexation
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Métadonnées pour les réseaux sociaux
    category: "entertainment",
    classification: "podcast",

    // Métadonnées pour les moteurs de recherche
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b3e26",
};
