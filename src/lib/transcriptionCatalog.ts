import type { Prisma } from "@prisma/client";
import { SITE_URL } from "@/helpers/config";
import { getTranscriptionDownloadUrl } from "@/helpers/transcriptionHelpers";
import { prisma } from "@/lib/prisma";
import {
  buildContextBiasFromFilms,
  transcriptionFilmSelect,
} from "@/lib/transcriptionContext";

export type TranscriptionStatus = "all" | "missing" | "available";

// « anonce » est la valeur historique enregistrée par le site.
const ANNOUNCEMENT_GENRES = ["anonce", "annonce"];

export function parseTranscriptionStatus(
  value: string | null,
  fallback: TranscriptionStatus,
): TranscriptionStatus | null {
  if (value === null) return fallback;
  return value === "all" || value === "missing" || value === "available"
    ? value
    : null;
}

const episodeSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  audioUrl: true,
  duration: true,
  season: true,
  episode: true,
  genre: true,
  pubDate: true,
  updatedAt: true,
  transcription: {
    select: { fileName: true, fileType: true, fileSize: true, updatedAt: true },
  },
  links: { select: { film: { select: transcriptionFilmSelect } } },
} satisfies Prisma.PodcastEpisodeSelect;

type CatalogEpisode = Prisma.PodcastEpisodeGetPayload<{
  select: typeof episodeSelect;
}>;

const CONTENT_TYPES: Record<string, string> = {
  json: "application/json",
  srt: "application/x-subrip",
  vtt: "text/vtt",
  txt: "text/plain",
};

export function toTranscriptionCatalogEntry(episode: CatalogEpisode) {
  const pageUrl = `${SITE_URL}/episodes/${encodeURIComponent(episode.slug!)}`;
  const terms = buildContextBiasFromFilms(
    episode.links.map(({ film }) => film),
  );
  const transcription = episode.transcription;
  const format = transcription?.fileType.toLowerCase().replace(/^\./, "");

  return {
    id: episode.id,
    slug: episode.slug!,
    title: episode.title,
    description: episode.description,
    url: pageUrl,
    audioUrl: episode.audioUrl,
    durationSeconds: episode.duration,
    language: "fr",
    season: episode.season,
    episode: episode.episode,
    genre: episode.genre,
    publishedAt: episode.pubDate.toISOString(),
    updatedAt: episode.updatedAt.toISOString(),
    status: transcription ? ("available" as const) : ("missing" as const),
    needsTranscription:
      !transcription &&
      !ANNOUNCEMENT_GENRES.includes(episode.genre?.toLowerCase() ?? ""),
    transcription: transcription
      ? {
          url: getTranscriptionDownloadUrl(
            encodeURIComponent(transcription.fileName),
          ),
          pageUrl: `${pageUrl}/transcription`,
          format: format!,
          contentType: CONTENT_TYPES[format!] ?? "application/octet-stream",
          sizeBytes: transcription.fileSize,
          updatedAt: transcription.updatedAt.toISOString(),
        }
      : null,
    context: {
      terms,
      text: terms.join(", "),
      url: `${SITE_URL}/api/transcription/context?slug=${encodeURIComponent(episode.slug!)}`,
    },
  };
}

export type TranscriptionCatalogEntry = ReturnType<
  typeof toTranscriptionCatalogEntry
>;

export async function getTranscriptionCatalog(
  status: TranscriptionStatus,
  limit?: number,
): Promise<TranscriptionCatalogEntry[]> {
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      slug: { not: null },
      rssFeed: { nameId: "la-boite-de-chocolat" },
      // Conserver les épisodes sans classification, exclure le contenu adulte.
      OR: [{ age: null }, { age: { notIn: ["18+", "adult"] } }],
      ...(status === "missing"
        ? {
            transcription: null,
            AND: {
              OR: [
                { genre: null },
                {
                  genre: {
                    notIn: ANNOUNCEMENT_GENRES,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
      ...(status === "available" ? { transcription: { isNot: null } } : {}),
    },
    select: episodeSelect,
    orderBy: [{ pubDate: "desc" }, { id: "asc" }],
    ...(limit === undefined ? {} : { take: limit }),
  });
  return episodes.map(toTranscriptionCatalogEntry);
}
