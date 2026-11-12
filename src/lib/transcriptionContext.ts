import type { Prisma } from "@prisma/client";

export const transcriptionFilmSelect = {
  title: true,
  director: true,
  saga: { select: { name: true } },
  directors: { select: { person: { select: { name: true } } } },
  cast: {
    select: { character: true, person: { select: { name: true } } },
    orderBy: { order: "asc" },
    take: 15,
  },
} satisfies Prisma.FilmSelect;

type ContextFilm = Prisma.FilmGetPayload<{
  select: typeof transcriptionFilmSelect;
}>;

// Même vocabulaire pour le traitement local et pour l'intégration Mistral.
export function buildContextBiasFromFilms(films: ContextFilm[]): string[] {
  const terms = new Set<string>(["La Boîte de Chocolat"]);
  for (const film of films) {
    if (film.title) terms.add(film.title);
    if (film.director) terms.add(film.director);
    if (film.saga?.name) terms.add(film.saga.name);
    for (const { person } of film.directors) {
      if (person.name) terms.add(person.name);
    }
    for (const { person, character } of film.cast) {
      if (person.name) terms.add(person.name);
      if (character) terms.add(character);
    }
  }
  return [...terms].filter(Boolean).slice(0, 100);
}
