import { ImageResponse } from "next/og";
import {
  OGImageLayout,
  ImageContainer,
  ImageShadow,
  ModernImage,
  PlayButton,
  EpisodeContent,
  DefaultTemplate,
} from "@/components/OGImageLayout/OGImageLayout";
import { SITE_URL } from "@/helpers/config";
import { EpisodeData } from "@/app/api/episode/[slug]/route";

export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? SITE_URL
        : "http://localhost:3000";

    const episode: EpisodeData = await fetch(`${baseUrl}/api/episode/${params.slug}`).then(
      (res) => res.json()
    );

    const episodeData = episode.episode;
    let mainFilmImageUrl = episode.mainFilmImageUrl;

    if (mainFilmImageUrl.startsWith("/api/image/masked/")) {
      mainFilmImageUrl = `${baseUrl}${mainFilmImageUrl}`;
    }

    const episodeNumber = episodeData?.episode
      ? `E${episodeData.episode.toString().padStart(2, "0")}`
      : "";
    const seasonNumber = episodeData?.season
      ? `S${episodeData.season.toString().padStart(2, "0")}`
      : "";

    const podcastEpisode =
      seasonNumber && episodeNumber
        ? `${seasonNumber} • ${episodeNumber}`
        : episodeNumber || seasonNumber || "";

    const isNew = episodeData?.pubDate
      ? new Date(episodeData?.pubDate) >
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
              <ModernImage src={mainFilmImageUrl} alt="" />
              <PlayButton />
            </ImageContainer>
          }
          rightContent={
            <EpisodeContent
              title={episodeData?.title || "Nouvel Épisode"}
              episodeNumber={podcastEpisode}
              isNew={isNew}
            />
          }
        />
      ),
      {
        ...size,
      }
    );
  } catch (e: any) {
    console.error("Erreur lors de la génération de l'image Open Graph:", e);

    return new ImageResponse(
      <DefaultTemplate />,
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
