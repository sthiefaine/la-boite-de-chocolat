import { Metadata, Viewport } from "next";
import { SITE_URL } from "@/helpers/config";
import { getEpisodeBySlugCached } from "@/app/actions/episode";
import { truncateText } from "@/helpers/podcastHelpers";

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
      title: "Épisode non trouvé",
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

  const { episode, mainFilm, isAdultContent } = episodeData;
  const title = mainFilm?.title || episode.title;
  const season = episode.season || null;
  const episodeNumber = episode.episode || null;
  const episodeNumberText = episodeNumber ? `E${episodeNumber}` : "";
  const fullTitle = `S${season} ${episodeNumberText} - ${title}`;

  // Description enrichie : combine film info + description épisode
  let description = "";
  if (mainFilm) {
    description = `Critique du film ${mainFilm.title}`;
    if (mainFilm.director) description += ` de ${mainFilm.director}`;
    if (mainFilm.year) description += ` (${mainFilm.year})`;
    description += ".";
  }

  // Ajouter la description de l'épisode si disponible pour enrichir
  if (episode.description) {
    const cleanDesc = episode.description.replace(/<[^>]*>/g, "").trim();
    if (cleanDesc) {
      const remaining = 155 - description.length - 1;
      if (remaining > 30) {
        description += " " + truncateText(cleanDesc, remaining);
      }
    }
  }

  description = description || `Écoutez l'épisode sur ${title} - La Boîte de Chocolat`;
  const isAdult = isAdultContent;

  const ogImageUrl = `/episodes/${slug}/opengraph-image`;
  const twitterImageUrl = `/episodes/${slug}/twitter-image`;
  const canonicalUrl = `${SITE_URL}/episodes/${slug}`;

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
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "La Boîte de Chocolat" }],
    creator: "La Boîte de Chocolat",
    publisher: "La Boîte de Chocolat",

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: !isAdult,
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

    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      publishedTime: episode.pubDate.toISOString(),
      modifiedTime: episode.updatedAt?.toISOString(),
      authors: ["La Boîte de Chocolat"],
      section: "Podcast Cinéma",
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
            : `Poster du film ${mainFilm?.title || title}`,
          type: "image/png",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [twitterImageUrl],
    },

    // Metadata complémentaire (sans doublons OG/Twitter/robots)
    other: {
      "podcast:author": "La Boîte de Chocolat",
      "podcast:season": season?.toString() || "",
      "podcast:episode": episodeNumber?.toString() || "0",
      "podcast:duration": episode.duration?.toString() || "",
      "podcast:explicit": isAdult ? "true" : "false",

      "article:published_time": episode.pubDate.toISOString(),
      "article:modified_time": episode.updatedAt?.toISOString() || "",
      "article:author": "La Boîte de Chocolat",
      "article:section": "Podcast",
      "article:tag": keywords.join(","),

      "DC.title": fullTitle,
      "DC.creator": "La Boîte de Chocolat",
      "DC.description": description,
      "DC.date": episode.pubDate.toISOString(),
      "DC.language": "fr-FR",
      "DC.type": "Audio",
      "DC.format": "audio/mpeg",
    },

    applicationName: "La Boîte de Chocolat",
    category: "entertainment",
    classification: "podcast",
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
