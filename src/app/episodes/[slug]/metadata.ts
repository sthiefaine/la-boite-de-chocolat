import { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/config";
import { getEpisodeBySlugCached } from "@/app/actions/episode";
import { getOpenGraphImageUrl } from "@/app/actions/image";

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
      robots: "noindex, nofollow",
    };
  }

  const { episode, mainFilm, isAdultContent, mainFilmImageUrl } = episodeData;
  const title = mainFilm?.title || episode.title;
  const season = episode.season || null;
  const episodeNumber = episode.episode || null;
  const fullTitle = `S${season}E${episodeNumber} - ${title} - La Boîte de Chocolat`;

  // Description enrichie
  let description = episode.description?.substring(0, 160);
  if (!description && mainFilm) {
    description = `Découvrez notre analyse du film ${mainFilm.title}`;
    if (mainFilm.director) description += ` de ${mainFilm.director}`;
    if (mainFilm.year) description += ` (${mainFilm.year})`;
    description += " dans ce nouvel épisode de La Boîte de Chocolat.";
  }
  description = description || `Écoutez l'épisode sur ${title}`;

  // Générer l'URL de l'image Open Graph optimisée
  const ogImageUrl = mainFilmImageUrl
    ? await getOpenGraphImageUrl(mainFilm.imgFileName, mainFilm.age || null)
    : "/api/image/og-default";
  const isAdult = isAdultContent;

  const ogImageUrlWithSlug = ogImageUrl + `?slug=${slug}`;

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
    metadataBase: new URL(SITE_URL),
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
      images: [
        {
          url: ogImageUrlWithSlug,
          width: 1200,
          height: 630,
          alt: isAdult
            ? "Poster flouté - contenu 18+"
            : `Poster de ${mainFilm?.title}`,
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
      images: [ogImageUrl],
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

    // Métadonnées pour les favicons et manifestes
    icons: {
      icon: [
        { url: "/images/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/images/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/images/icons/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          url: "/images/icons/android-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b3e26",
};
