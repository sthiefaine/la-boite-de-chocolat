import { SITE_URL } from "@/helpers/config";

interface PersonJsonLdProps {
  person: {
    id: string;
    name: string;
    slug: string;
    photoFileName: string | null;
    tmdbId: number;
    directedFilms: Array<{
      id: string;
      title: string;
      slug: string;
      year: number | null;
    }>;
    actedFilms: Array<{
      id: string;
      title: string;
      slug: string;
      year: number | null;
      character: string | null;
    }>;
  };
}

export function PersonJsonLd({ person }: PersonJsonLdProps) {
  const personUrl = `${SITE_URL}/people/${person.slug}`;
  const photoUrl = person.photoFileName
    ? `https://uploadfiles.clairdev.com/api/display/podcasts/people/${person.photoFileName}`
    : undefined;

  const isDirector = person.directedFilms.length > 0;
  const isActor = person.actedFilms.length > 0;

  const jobTitles: string[] = [];
  if (isDirector) jobTitles.push("Réalisateur");
  if (isActor) jobTitles.push("Acteur");

  const knowsAbout: string[] = ["Cinéma"];
  if (isDirector) knowsAbout.push("Réalisation");
  if (isActor) knowsAbout.push("Interprétation");

  const actedFilmObjects = person.actedFilms.map((film) => ({
    "@type": "Movie" as const,
    name: film.title,
    url: `${SITE_URL}/films/${film.slug}`,
    ...(film.year ? { dateCreated: film.year.toString() } : {}),
  }));

  const directedFilmObjects = person.directedFilms.map((film) => ({
    "@type": "Movie" as const,
    name: film.title,
    url: `${SITE_URL}/films/${film.slug}`,
    ...(film.year ? { dateCreated: film.year.toString() } : {}),
  }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: personUrl,
    ...(photoUrl ? { image: photoUrl } : {}),
    sameAs: `https://www.themoviedb.org/person/${person.tmdbId}`,
    jobTitle: jobTitles.length === 1 ? jobTitles[0] : jobTitles,
    knowsAbout,
    ...(actedFilmObjects.length > 0 ? { performerIn: actedFilmObjects } : {}),
    ...(directedFilmObjects.length > 0
      ? {
          "@reverse": {
            director: directedFilmObjects,
          },
        }
      : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": personUrl,
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
