import { SITE_URL } from "@/helpers/config";

interface Film {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  imgFileName: string | null;
  director: string | null;
  age: string | null;
  budget: bigint | null;
  revenue: bigint | null;
  tmdbId: number | null;
  saga: { id: string; name: string; slug: string } | null;
  links: Array<{
    podcast: {
      title: string;
      slug: string | null;
      pubDate: Date;
      duration: number | null;
    };
  }>;
}

interface FilmJsonLdProps {
  film: Film;
}

export async function FilmJsonLd({ film }: FilmJsonLdProps) {
  const isAdult = film.age === "18+" || film.age === "adult";

  const imageUrl = film.imgFileName
    ? `https://uploadfiles.clairdev.com/api/display/podcasts/films/${film.imgFileName}`
    : undefined;

  const podcastEpisodes = film.links
    .filter((link) => link.podcast.slug)
    .map((link) => ({
      "@type": "PodcastEpisode" as const,
      name: link.podcast.title,
      url: `${SITE_URL}/episodes/${link.podcast.slug}`,
      datePublished: link.podcast.pubDate.toISOString(),
    }));

  const additionalProperties: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }> = [];

  if (film.budget) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "budget",
      value: `${Number(film.budget)} USD`,
    });
  }

  if (film.revenue) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "boxOfficeRevenue",
      value: `${Number(film.revenue)} USD`,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: film.title,
    ...(film.year ? { dateCreated: film.year.toString() } : {}),
    ...(film.director
      ? { director: { "@type": "Person", name: film.director } }
      : {}),
    contentRating: isAdult ? "18+" : "General",
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(film.tmdbId
      ? { sameAs: `https://www.themoviedb.org/movie/${film.tmdbId}` }
      : {}),
    ...(film.saga
      ? {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: film.saga.name,
          },
        }
      : {}),
    inLanguage: "fr-FR",
    ...(podcastEpisodes.length > 0 ? { subjectOf: podcastEpisodes } : {}),
    ...(additionalProperties.length > 0
      ? { additionalProperty: additionalProperties }
      : {}),
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
