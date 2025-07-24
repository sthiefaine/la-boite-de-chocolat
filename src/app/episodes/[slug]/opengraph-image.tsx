import { ImageResponse } from "next/og";
import { getEpisodeBySlugCached } from "@/app/actions/episode";
import { getMaskedImageUrl } from "@/app/actions/image";
import { getUploadServerUrl } from "@/helpers/imageConfig";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episodeData = await getEpisodeBySlugCached(slug);

  if (!episodeData) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #6b3e26 0%, #a67c52 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          <h1 style={{ fontSize: 48, margin: 0, textAlign: "center" }}>
            Épisode non trouvé
          </h1>
          <p style={{ fontSize: 24, margin: "20px 0 0 0", opacity: 0.8 }}>
            La Boîte de Chocolat
          </p>
        </div>
      ),
      size
    );
  }

  const { episode, mainFilm, isAdultContent } = episodeData;
  const title = mainFilm?.title || episode.title;
  const season = episode.season || null;
  const episodeNumber = episode.episode || null;
  const episodeNumberText = episodeNumber ? `E${episodeNumber}` : "";
  const fullTitle = `S${season} ${episodeNumberText} - ${title}`;

  // Image de fond
  let backgroundImage = "";
  if (isAdultContent && mainFilm?.imgFileName) {
    backgroundImage = await getMaskedImageUrl(
      mainFilm.imgFileName,
      mainFilm.age || null
    );
  } else if (mainFilm?.imgFileName) {
    backgroundImage = getUploadServerUrl(mainFilm.imgFileName);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: backgroundImage
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`
            : "linear-gradient(135deg, #6b3e26 0%, #a67c52 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          <h1
            style={{
              fontSize: 48,
              margin: "0 0 20px 0",
              fontWeight: "bold",
              lineHeight: 1.2,
            }}
          >
            {fullTitle}
          </h1>
          <p
            style={{
              fontSize: 24,
              margin: "0 0 30px 0",
              opacity: 0.9,
              lineHeight: 1.4,
            }}
          >
            {mainFilm?.director && mainFilm?.year
              ? `${mainFilm.director} (${mainFilm.year})`
              : "Podcast de critique cinématographique"}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              fontSize: 20,
              opacity: 0.8,
            }}
          >
            <span>🎬 La Boîte de Chocolat</span>
            {episode.duration && (
              <span>⏱️ {Math.round(episode.duration / 60)}min</span>
            )}
          </div>
        </div>
      </div>
    ),
    size
  );
}
