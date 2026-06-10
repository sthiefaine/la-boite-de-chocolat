import { prisma } from "@/lib/prisma";
import { searchMovies, checkFilmExists, createFilmFromTMDB } from "@/app/actions/film";
import { linkEpisodeToFilm } from "@/app/actions/episode";

// Liaison automatique épisode → film TMDB.
// Formats de titres observés dans le flux RSS :
//   "Cliffhanger"                      → film
//   "Godzilla (1998)"                  → film + année à désambiguïser
//   "p0rno - La Collectionneuse"       → film 18+
//   "- BONUS - Fast and Furious 5"     → film (préfixe bonus à retirer)
//   "- Petit Cadeau Secret Santa -"    → ANNONCE, ne jamais lier

const ADULT_PREFIX_REGEX = /^p[o0]rn[o0]\s*-\s*/i;
const BONUS_PREFIX_REGEX = /^-+\s*bonus\s*-+\s*/i;
// Titre entièrement encadré de tirets, ou mot-clé d'annonce explicite.
const ANNOUNCEMENT_WRAP_REGEX = /^-\s*[^-].*-$/;
const ANNOUNCEMENT_KEYWORD_REGEX = /^(annonce|teaser|hors[- ]?s[eé]rie)\b/i;
const YEAR_IN_TITLE_REGEX = /\s*\((\d{4})\)\s*/;

export type AutoLinkResult = {
  episodeTitle: string;
  status:
    | "linked"
    | "already"
    | "no_match"
    | "low_confidence"
    | "skipped_announcement"
    | "error";
  filmTitle?: string;
  error?: string;
};

export function parseEpisodeTitle(title: string): {
  query: string;
  isAdult: boolean;
  isAnnouncement: boolean;
  year: number | null;
} {
  let rest = title.trim();

  if (
    ANNOUNCEMENT_WRAP_REGEX.test(rest) ||
    ANNOUNCEMENT_KEYWORD_REGEX.test(rest)
  ) {
    return { query: "", isAdult: false, isAnnouncement: true, year: null };
  }

  rest = rest.replace(BONUS_PREFIX_REGEX, "").trim();

  let isAdult = false;
  if (ADULT_PREFIX_REGEX.test(rest)) {
    isAdult = true;
    rest = rest.replace(ADULT_PREFIX_REGEX, "").trim();
  }

  let year: number | null = null;
  const yearMatch = rest.match(YEAR_IN_TITLE_REGEX);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
    rest = rest.replace(YEAR_IN_TITLE_REGEX, " ").trim();
  }

  return { query: rest, isAdult, isAnnouncement: false, year };
}

const normalizeTitle = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const titleWords = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

type TMDBSearchResult = {
  id: number;
  title: string;
  original_title: string;
  release_date?: string;
};

const isSubset = (a: string[], b: string[]) =>
  a.length > 0 && a.every((w) => b.includes(w));

// Choix du meilleur match avec seuil de confiance :
// 1. si une année est connue, ne garder que les films sortis à ±1 an ;
// 2. titre exact normalisé (fr ou original) ;
// 3. mots de l'un inclus dans ceux de l'autre ("Thor 3 - Ragnarok" ↔ "Thor : Ragnarok") ;
// 4. sinon AUCUN match : mieux vaut pas de lien qu'un mauvais film créé.
function pickBestMatch(
  results: TMDBSearchResult[],
  query: string,
  year: number | null
): TMDBSearchResult | null {
  let candidates = results.slice(0, 10);

  if (year) {
    const sameYear = candidates.filter((m) => {
      const y = m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : NaN;
      return !Number.isNaN(y) && Math.abs(y - year) <= 1;
    });
    if (sameYear.length > 0) candidates = sameYear;
  }

  const normalizedQuery = normalizeTitle(query);
  const exact = candidates.find(
    (m) =>
      normalizeTitle(m.title) === normalizedQuery ||
      normalizeTitle(m.original_title) === normalizedQuery
  );
  if (exact) return exact;

  const queryWords = titleWords(query);
  const wordMatch = candidates.find((m) => {
    const fr = titleWords(m.title);
    const original = titleWords(m.original_title);
    return (
      isSubset(fr, queryWords) ||
      isSubset(queryWords, fr) ||
      isSubset(original, queryWords) ||
      isSubset(queryWords, original)
    );
  });
  return wordMatch ?? null;
}

export async function autoLinkFilmToEpisode(episode: {
  id: string;
  title: string;
}): Promise<AutoLinkResult> {
  try {
    const { query, isAdult, isAnnouncement, year } = parseEpisodeTitle(
      episode.title
    );

    if (isAnnouncement) {
      // Marquer comme annonce (badge UI existant) : sort l'épisode du
      // pipeline d'auto-liaison de façon permanente.
      await prisma.podcastEpisode.update({
        where: { id: episode.id },
        data: { genre: "Annonce" },
      });
      return { episodeTitle: episode.title, status: "skipped_announcement" };
    }

    if (!query) {
      return { episodeTitle: episode.title, status: "no_match", error: "Titre vide" };
    }

    const searchResult = await searchMovies(query, isAdult);
    if (!searchResult.success || !searchResult.movies?.length) {
      return { episodeTitle: episode.title, status: "no_match" };
    }

    const match = pickBestMatch(searchResult.movies, query, year);
    if (!match) {
      // Des résultats existent mais aucun n'est assez sûr : on laisse
      // l'humain trancher via le wizard plutôt que de créer un mauvais film.
      return { episodeTitle: episode.title, status: "low_confidence" };
    }

    // Réutiliser le film s'il existe déjà, sinon le créer (poster TMDB
    // téléchargé + saga auto-détectée via belongs_to_collection).
    let filmId: string;
    const existing = await checkFilmExists(match.id);
    if (existing.success && existing.exists && existing.film) {
      filmId = existing.film.id;
    } else {
      const created = await createFilmFromTMDB(
        match.id,
        undefined,
        undefined,
        isAdult ? "18+" : undefined,
        undefined
      );
      if (!created.success || !created.film) {
        return {
          episodeTitle: episode.title,
          status: "error",
          filmTitle: match.title,
          error: created.error || "Échec création film",
        };
      }
      filmId = created.film.id;
    }

    const link = await linkEpisodeToFilm(episode.id, filmId);
    if (!link.success) {
      // Lien déjà présent = état déjà correct, pas une erreur.
      const already = link.error?.toLowerCase().includes("déjà") ||
        link.error?.toLowerCase().includes("existe");
      return {
        episodeTitle: episode.title,
        status: already ? "already" : "error",
        filmTitle: match.title,
        ...(already ? {} : { error: link.error }),
      };
    }

    return { episodeTitle: episode.title, status: "linked", filmTitle: match.title };
  } catch (error) {
    return {
      episodeTitle: episode.title,
      status: "error",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
