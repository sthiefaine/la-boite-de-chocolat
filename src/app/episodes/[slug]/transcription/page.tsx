"use server";

import { notFound } from "next/navigation";
import { getEpisodeBySlugCached } from "@/app/actions/episode";
import { downloadTranscriptionContent } from "@/app/actions/transcription";
import { parseSRT, searchInTranscription, formatFileSize, parseWithTimeMarkers } from "@/helpers/transcriptionHelpers";
import TranscriptionPage from "./TranscriptionPage";
import { generateMetadata } from "./metadata";

export { generateMetadata };

interface TranscriptionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TranscriptionPageServer({ params }: TranscriptionPageProps) {
  const { slug } = await params;

  const episodeResult = await getEpisodeBySlugCached(slug);

  if (!episodeResult) {
    notFound();
  }

  const episode = episodeResult.episode;

  if (!episode.transcription) {
    notFound();
  }

  // Charger le contenu de la transcription
  const transcriptionResult = await downloadTranscriptionContent(episode.id);
  
  if (!transcriptionResult.success || !transcriptionResult.transcription) {
    notFound();
  }

  const content = transcriptionResult.transcription.content;
  const isVTT = content.includes('-->');
  const detectedFormat = isVTT ? 'vtt' : 'srt';
  
  // Essayer d'abord le parsing standard
  const parsedEntries = parseSRT(content);
  
  // Si pas d'entrées, utiliser le parser avec repères temporels
  const timeMarkedSections = parsedEntries.length === 0 ? parseWithTimeMarkers(content) : null;

  return (
    <TranscriptionPage
      episode={episode}
      transcription={episode.transcription}
      content={content}
      entries={parsedEntries}
      detectedFormat={detectedFormat}
      timeMarkedSections={timeMarkedSections}
    />
  );
} 