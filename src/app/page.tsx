"use server";
import { getEpisodesWithFilms, getLatestEpisode } from "./actions/episode";

import LatestEpisodeSection from "@/components/Sections/LatestEpisodeSection/LatestEpisodeSection";
import HeroSection from "@/components/Sections/HeroSection/HeroSection";
import EpisodesSection from "@/components/Sections/EpisodesSection/EpisodesSection";

export interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
  season?: number | null;
  episode?: number | null;
  slug: string | null;
  links: Array<{
    film: {
      id: string;
      title: string;
      slug: string;
      year: number | null;
      imgFileName: string | null;
      age: string | null;
      saga: {
        name: string;
        id: string;
        slug: string;
      } | null;
    };
  }>;
}

export type LatestEpisodeData = Omit<Episode, "links"> & {
  links: Array<{
    film: Omit<Episode["links"][number]["film"], "saga">;
  }>;
};

export default async function Home() {
  const episodesResult = await getEpisodesWithFilms();
  const episodes = episodesResult.success ? episodesResult.data : [];
  const latestEpisode = await getLatestEpisode();
  return (
    <main>
      <HeroSection episodes={episodes || []} />
      {/*<LatestEpisodeSection episode={latestEpisode.data || null} />*/}
      <EpisodesSection episodes={episodes || []} />
    </main>
  );
}
