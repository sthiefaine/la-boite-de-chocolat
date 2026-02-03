"use server";
import { SITE_URL, PODCAST_URLS } from "@/helpers/config";
import { getMaskedImageUrl } from "@/app/actions/image";

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  pubDate: Date;
  updatedAt?: Date;
  duration?: number | null;
  episode?: number | null;
  season?: number | null;
  audioUrl: string;
  slug: string | null;
  age?: string | null;
  genre?: string | null;
  imgFileName?: string | null;
  links: Array<{
    film?: {
      id: string;
      title: string;
      year: number | null;
      imgFileName: string | null;
      age: string | null;
      director?: string | null;
      budget?: bigint | null;
      revenue?: bigint | null;
      saga?: {
        id: string;
        name: string;
        description?: string | null;
        imgFileName?: string | null;
        filmsOrder?: string[];
      } | null;
      tmdbId?: number | null;
    } | null;
  }>;
}

interface JsonLdProps {
  episode: Episode;
  canonicalUrl: string;
}

export async function PodcastJsonLd({ episode, canonicalUrl }: JsonLdProps) {
  const mainFilm = episode.links[0]?.film;
  const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  let description = "";
  if (!description && mainFilm) {
    description = `Découvrez notre analyse du film ${mainFilm.title}`;
    if (mainFilm.director) description += ` de ${mainFilm.director}`;
    if (mainFilm.year) description += ` (${mainFilm.year})`;
    description += " dans ce nouvel épisode de La Boîte de Chocolat.";
  }
  description = description || episode.description?.slice(0, 120) + "...";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: description,
    url: canonicalUrl,
    datePublished: episode.pubDate.toISOString(),
    dateModified: episode.updatedAt?.toISOString(),
    duration: episode.duration ? `PT${episode.duration}S` : undefined,
    episodeNumber: episode.episode ? episode.episode.toString() : undefined,
    seasonNumber: episode.season ? episode.season.toString() : undefined,
    associatedMedia: {
      "@type": "AudioObject",
      contentUrl: episode.audioUrl,
      encodingFormat: "audio/mpeg",
      duration: episode.duration ? `PT${episode.duration}S` : undefined,
      inLanguage: "fr-FR",
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "La Boîte de Chocolat",
      description:
        "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi.",
      url: `${SITE_URL}/episodes`,
      webFeed: PODCAST_URLS.rss,
      genre: ["Film", "Cinéma", "Entertainment"],
      inLanguage: "fr-FR",
      creator: {
        "@type": "Organization",
        name: "La Boîte de Chocolat",
        url: SITE_URL,
      },
    },
    about: mainFilm
      ? {
          "@type": "Movie",
          name: mainFilm.title,
          director: mainFilm.director
            ? {
                "@type": "Person",
                name: mainFilm.director,
              }
            : undefined,
          dateCreated: mainFilm.year?.toString(),
          contentRating: isAdult ? "18+" : "General",
          ...(mainFilm.saga ? { isPartOf: { "@type": "CreativeWorkSeries", name: mainFilm.saga.name } } : {}),
          ...(mainFilm.tmdbId ? { sameAs: `https://www.themoviedb.org/movie/${mainFilm.tmdbId}` } : {}),
          image: mainFilm.imgFileName
            ? await getMaskedImageUrl(
                mainFilm.imgFileName,
                mainFilm.age || null
              )
            : undefined,
        }
      : undefined,
    creator: {
      "@type": "Organization",
      name: "La Boîte de Chocolat",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "La Boîte de Chocolat",
      url: SITE_URL,
    },
    inLanguage: "fr-FR",
    contentRating: isAdult ? "mature" : "general",
    keywords: [
      "podcast",
      "cinéma",
      "critique",
      "film",
      mainFilm?.title,
      mainFilm?.director,
      "La Boîte de Chocolat",
    ].filter(Boolean),

    // Données spécifiques pour les IA
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "AI_ContentType",
        value: "podcast-episode",
      },
      {
        "@type": "PropertyValue",
        name: "AI_Topic",
        value: mainFilm?.title || "cinéma",
      },
      {
        "@type": "PropertyValue",
        name: "AI_Language",
        value: "french",
      },
      {
        "@type": "PropertyValue",
        name: "AI_Category",
        value: "entertainment",
      },
      {
        "@type": "PropertyValue",
        name: "AI_SubCategory",
        value: "film-review",
      },
    ],

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
