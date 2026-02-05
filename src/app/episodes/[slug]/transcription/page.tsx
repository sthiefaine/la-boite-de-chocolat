"use server";

import { notFound } from "next/navigation";
import { getEpisodeBySlugCached, getAllEpisodeSlugsWithTranscription } from "@/app/actions/episode";
import { downloadTranscriptionContent } from "@/app/actions/transcription";
import {
  parseTranscription,
  parseWithTimeMarkers,
  srtTimeToSeconds,
} from "@/helpers/transcriptionHelpers";
import TranscriptionPage from "./TranscriptionPage";
import { generateMetadata } from "./metadata";

export { generateMetadata };

interface TranscriptionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const result = await getAllEpisodeSlugsWithTranscription();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((episode) => ({
    slug: episode.slug,
  }));
}

export default async function TranscriptionPageServer({
  params,
}: TranscriptionPageProps) {
  const { slug } = await params;

  const episodeResult = await getEpisodeBySlugCached(slug);

  if (!episodeResult) {
    notFound();
  }

  const episode = episodeResult.episode;
  const mainFilmImageUrl = decodeURIComponent(episodeResult.mainFilmImageUrl);

  if (!episode.transcription) {
    notFound();
  }

  const transcriptionResult = await downloadTranscriptionContent(episode.id);

  if (!transcriptionResult.success || !transcriptionResult.transcription) {
    notFound();
  }

  const content = transcriptionResult.transcription.content;

  const parsedEntries = parseTranscription(content);

  const timeMarkedSections =
    parsedEntries.length === 0 ? parseWithTimeMarkers(content) : null;

  const entriesAsSections =
    parsedEntries.length > 0
      ? parsedEntries.map((entry, index) => ({
          id: index + 1,
          timeMarker: entry.startTime.split(",")[0],
          content: entry.text,
          startSeconds: srtTimeToSeconds(entry.startTime),
          endSeconds: srtTimeToSeconds(entry.endTime),
          ...(entry.speaker_id && { speaker_id: entry.speaker_id }),
        }))
      : null;

  return (
    <TranscriptionPage
      episode={episode}
      content={content}
      entries={parsedEntries}
      timeMarkedSections={timeMarkedSections || entriesAsSections}
      mainFilmImageUrl={mainFilmImageUrl}
    />
  );
}
