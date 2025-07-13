import { SITE_URL } from "@/lib/config";
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

export async function PodcastJsonLd({
  episode,
  canonicalUrl,
}: JsonLdProps) {
  const mainFilm = episode.links[0]?.film;
  const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.description || "Podcast de critique cinématographique de La Boîte de Chocolat",
    url: canonicalUrl,
    datePublished: episode.pubDate.toISOString(),
    dateModified: episode.updatedAt?.toISOString(),
    duration: episode.duration ? `PT${episode.duration}S` : undefined,
    episodeNumber: episode.episode ? episode.episode.toString() : undefined,
    seasonNumber: episode.season ? episode.season.toString() : undefined,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "La Boîte de Chocolat",
      description: "Podcast de critique cinématographique",
      url: `${SITE_URL}/podcast`,
      genre: "Arts",
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
          director: mainFilm.director,
          dateCreated: mainFilm.year?.toString(),
          contentRating: isAdult ? "18+" : "General",
          genre: "Film",
          image: mainFilm.imgFileName ? await getMaskedImageUrl(mainFilm.imgFileName, mainFilm.age || null) : undefined,
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

// Utilisation dans votre page :
// import { PodcastJsonLd } from "./json-ld";
//
// export default function PodcastPage() {
//   return (
//     <>
//       <PodcastJsonLd
//         episode={episode}
//         mainFilm={mainFilm}
//         canonicalUrl={canonicalUrl}
//       />
//       <main>
//         {/* Votre contenu */}
//       </main>
//     </>
//   );
// }
