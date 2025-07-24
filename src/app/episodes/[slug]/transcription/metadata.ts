import { Metadata } from "next";
import { getEpisodeBySlugCached } from "@/app/actions/episode";
import { downloadTranscriptionContent } from "@/app/actions/transcription";

interface GenerateMetadataProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { slug } = await params;

  const episodeResult = await getEpisodeBySlugCached(slug);

  if (!episodeResult || !episodeResult.episode.transcription) {
    return {
      title: "Transcription non trouvée",
      description: "La transcription demandée n'existe pas.",
    };
  }

  const episode = episodeResult.episode;
  const mainFilm = episode.links[0]?.film;
  const transcription = episode.transcription!;

  const title = mainFilm?.title || episode.title;
  const year = mainFilm?.year;
  const director = mainFilm?.director;

  const transcriptionResult = await downloadTranscriptionContent(episode.id);
  const content = transcriptionResult.success ? transcriptionResult.transcription?.content : '';
  const wordCount = content ? content.split(/\s+/).length : 0;

  return {
    title: `Transcription - ${title}${year ? ` (${year})` : ''} | La Boîte de Chocolat`,
    description: `Transcription complète de l'épisode sur ${title}${year ? ` (${year})` : ''}${director ? ` de ${director}` : ''}. ${wordCount} mots, format ${transcription.fileType.toUpperCase()}.`,
    openGraph: {
      title: `Transcription - ${title}${year ? ` (${year})` : ''}`,
      description: `Transcription complète de l'épisode sur ${title}${year ? ` (${year})` : ''}${director ? ` de ${director}` : ''}. ${wordCount} mots.`,
      type: "article",
      url: `/episodes/${slug}/transcription`,
    },
    twitter: {
      card: "summary",
      title: `Transcription - ${title}${year ? ` (${year})` : ''}`,
      description: `Transcription complète de l'épisode sur ${title}${year ? ` (${year})` : ''}${director ? ` de ${director}` : ''}. ${wordCount} mots.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}