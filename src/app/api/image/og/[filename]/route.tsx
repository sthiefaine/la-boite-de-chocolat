import { ImageResponse } from "next/og";
import { getVercelBlobUrl } from "@/lib/imageConfig";
import {
  OGImageLayout,
  ImageContainer,
  ImageShadow,
  ModernImage,
  PlayButton,
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

    console.log("Slug reçu:", slug);

    // Vérifier que le slug est présent
    if (!slug) {
      console.error("Slug manquant dans les paramètres");
      return new Response("Slug manquant", { status: 400 });
    }

    // Décoder l'URL si elle est encodée
    const decodedFilename = decodeURIComponent(filename);
    console.log("Filename décodé:", decodedFilename);

    const originalImageUrl = decodedFilename;

    // URL de l'API - utiliser l'URL de base de la requête
    const requestUrl = new URL(request.url);
    const apiUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    const episode = await fetch(`${apiUrl}/api/episode/${slug}`);

    if (!episode.ok) {
      console.error(
        "Erreur lors de la récupération de l'épisode:",
        episode.status
      );
      return new Response("Erreur lors de la récupération de l'épisode", {
        status: episode.status,
      });
    }

    const episodeData = await episode.json();

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

    // Vérifier si l'épisode est nouveau (moins de 7 jours)
    const isNew = episodeData?.episode?.pubDate
      ? new Date(episodeData.episode.pubDate) >
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
              <ModernImage src={originalImageUrl} alt="" />
              <PlayButton />
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
    console.error("Erreur lors de la génération de l'image Open Graph:", e);
    return new Response("Erreur de génération d'image", { status: 500 });
  }
}
