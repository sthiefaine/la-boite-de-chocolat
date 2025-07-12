import { NextRequest, NextResponse } from "next/server";
import { getEpisodeBySlugCached } from "@/app/actions/episode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug requis" },
        { status: 400 }
      );
    }

    const episodeData = await getEpisodeBySlugCached(slug);

    if (!episodeData) {
      return NextResponse.json(
        { error: "Épisode non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(episodeData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'épisode:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 