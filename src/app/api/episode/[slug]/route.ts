import { NextRequest, NextResponse } from "next/server";
import { getEpisodeBySlugCached } from "@/app/actions/episode";

interface Film {
  id: string;
  title: string;
  imgFileName: string | null;
  age: string | null;
  director: string | null;
  year: number | null;
  tmdbId: number | null;
  saga?: {
    id: string;
    name: string;
    description: string | null;
    imgFileName: string | null;
    films: Array<{
      id: string;
      title: string;
      year: number | null;
      slug: string;
    }>;
  } | null;
}

interface PodcastFilmLink {
  id: string;
  podcastId: string;
  filmId: string;
  film: Film;
}

interface PodcastEpisode {
  id: string;
  rssFeedId: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration: number | null;
  slug: string | null;
  season: number | null;
  episode: number | null;
  imgFileName: string | null;
  genre: string | null;
  age: string | null;
  createdAt: Date;
  updatedAt: Date;
  links: PodcastFilmLink[];
}

export interface EpisodeData {
  episode: PodcastEpisode;
  mainFilm: Film | null;
  saga: Film["saga"] | null;
  isAdultContent: boolean;
  mainFilmImageUrl: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug requis" }, { status: 400 });
    }

    const episodeData: EpisodeData | null = await getEpisodeBySlugCached(slug);

    if (!episodeData) {
      return NextResponse.json(
        { error: "Épisode non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(episodeData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'épisode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
