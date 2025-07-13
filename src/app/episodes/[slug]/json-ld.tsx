import { SITE_URL } from "@/lib/config";
import { getMaskedImageUrl } from "@/app/actions/image";

interface JsonLdProps {
  episode: {
    title: string;
    description?: string;
    pubDate: Date;
    updatedAt?: Date;
    duration?: number;
    episode?: number;
    season?: number;
    imgFileName?: string;
  };
  mainFilm?: {
    title: string;
    director?: string;
    year?: number;
    age?: string;
    imgFileName?: string;
  };
  canonicalUrl: string;
}

export async function PodcastJsonLd({
  episode,
  mainFilm,
  canonicalUrl,
}: JsonLdProps) {
  const isAdult = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.description,
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
