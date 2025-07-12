import { ImageResponse } from "next/og";
import { getVercelBlobUrl } from "@/lib/imageConfig";
import {
  OGImageLayout,
  ImageContainer,
  ImageShadow,
  ModernImage,
  AgeBadge,
  EpisodeContent,
} from "@/components/OGImageLayout/OGImageLayout";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    const decodedFilename = decodeURIComponent(filename);

    const originalImageUrl = decodedFilename;

    const requestUrl = new URL(request.url);
    const apiUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    const episode = slug ? await fetch(`${apiUrl}/api/episode/${slug}`) : null;
    const episodeData = episode ? await episode.json() : null;

    const episodeNumber = episodeData?.episode
      ? `E${episodeData.episode.episode.toString().padStart(2, "0")}`
      : "";
    const seasonNumber = episodeData?.episode?.season
      ? `S${episodeData.episode.season.toString().padStart(2, "0")}`
      : "";

    const podcastEpisode =
      seasonNumber && episodeNumber
        ? `${seasonNumber} • ${episodeNumber}`
        : episodeNumber || seasonNumber || "";

    const isNew = episodeData?.episode?.pubDate
      ? new Date(episodeData?.episode?.pubDate) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : false;

    return new ImageResponse(
      (
        <OGImageLayout
          showNewBadge={true}
          episodeNumber={podcastEpisode}
          isNew={isNew}
          leftContent={
            <ImageContainer>
              <ImageShadow />
              <ModernImage src={originalImageUrl} alt="" isAdult={true} />
              <AgeBadge />
            </ImageContainer>
          }
          rightContent={
            <EpisodeContent
              title={episodeData?.episode?.title || "Nouvel Épisode"}
              episodeNumber={podcastEpisode}
              isNew={isNew}
            />
          }
        />
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("Erreur lors de la génération de l'image masquée:", e);
    return new Response("Erreur de génération d'image", { status: 500 });
  }
}
