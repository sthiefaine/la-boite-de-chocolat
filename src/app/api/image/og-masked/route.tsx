import { ImageResponse } from "next/og";
import {
  OGImageLayout,
  ImageContainer,
  ImageShadow,
  ModernImage,
  AgeBadge,
  EpisodeContent,
} from "@/components/OGImageLayout/OGImageLayout";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest
) {
  try {

    const slug = req.nextUrl.searchParams.get("slug");
    const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_DEV_URL : "http://localhost:3000";

    const episode = slug ? await fetch(`${baseUrl}/api/episode/${slug}`) : null;
    const episodeData = episode ? await episode.json() : null;

    // Construire l'URL absolue pour l'image masquée
    let originalImageUrl = episodeData?.mainFilmImageUrl;
    if (episodeData?.mainFilmImageUrl?.startsWith("/api/image/masked/")) {
      const maskedImageUrl = `${baseUrl}${episodeData.mainFilmImageUrl}`;
      originalImageUrl = maskedImageUrl;
    }

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
