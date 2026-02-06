import { SITE_URL } from "@/helpers/config";

interface SagaFilm {
  id: string;
  title: string;
  year: number | null;
  slug: string;
  imgFileName: string | null;
  age: string | null;
  director: string | null;
}

interface Saga {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imgFileName: string | null;
  tmdbId: number | null;
  films: SagaFilm[];
}

interface SagaJsonLdProps {
  saga: Saga;
}

export function SagaJsonLd({ saga }: SagaJsonLdProps) {
  const imageUrl = saga.imgFileName
    ? `https://uploadfiles.clairdev.com/api/display/podcasts/sagas/${saga.imgFileName}`
    : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: saga.name,
    description: saga.description || undefined,
    url: `${SITE_URL}/sagas/${saga.slug}`,
    image: imageUrl,
    inLanguage: "fr-FR",
    numberOfItems: saga.films.length,
    hasPart: saga.films.map((film, index) => ({
      "@type": "Movie",
      name: film.title,
      dateCreated: film.year ? film.year.toString() : undefined,
      url: `${SITE_URL}/films/${film.slug}`,
      director: film.director
        ? {
            "@type": "Person",
            name: film.director,
          }
        : undefined,
      position: index + 1,
    })),
  };

  if (saga.tmdbId) {
    jsonLd.sameAs = `https://www.themoviedb.org/collection/${saga.tmdbId}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
