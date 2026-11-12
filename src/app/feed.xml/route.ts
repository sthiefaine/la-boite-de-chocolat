import { SITE_URL } from "@/helpers/config";
import { buildPodcastFeed } from "@/lib/podcastFeed";
import {
  getTranscriptionCatalog,
  parseTranscriptionStatus,
} from "@/lib/transcriptionCatalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = parseTranscriptionStatus(
    searchParams.get("transcription"),
    "all",
  );
  if (!status) {
    return Response.json(
      { error: "transcription doit être all, missing ou available" },
      { status: 400 },
    );
  }

  // Conserver les 50 entrées du flux habituel. Les modes archive et filtré
  // couvrent tous les épisodes, y compris ceux de l'ancien catalogue.
  const all = searchParams.get("all") === "true" || status !== "all";
  const selfUrl = new URL("/feed.xml", SITE_URL);
  if (all) selfUrl.searchParams.set("all", "true");
  if (status !== "all") selfUrl.searchParams.set("transcription", status);

  try {
    const episodes = await getTranscriptionCatalog(
      status,
      all ? undefined : 50,
    );
    return new Response(buildPodcastFeed(episodes, selfUrl.toString()), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("Erreur génération flux RSS:", error);
    return Response.json({ error: "Flux RSS indisponible" }, { status: 500 });
  }
}
