import { Metadata } from "next";
import { getEpisodesWithFilms, getLatestEpisode } from "./actions/episode";

import LatestEpisodeSection from "@/components/Sections/LatestEpisodeSection/LatestEpisodeSection";
import HeroSection from "@/components/Sections/HeroSection/HeroSection";
import EpisodesSection from "@/components/Sections/EpisodesSection/EpisodesSection";
import SagaCarousel from "@/components/Saga/SagaCarousel";
import BudgetCarousel from "@/components/Film/BudgetCarousel";
import { SITE_URL } from "@/helpers/config";

export const metadata: Metadata = {
  title: "La Boîte de Chocolat | Podcast Cinéma Français - Critiques & Analyses de Films",
  description:
    "Le podcast cinéma qui te fait aimer le cinoche (et la mauvaise foi). +118 épisodes de critiques de films : blockbusters, Marvel, classiques, thrillers. Écoute gratuite sur Spotify, Apple Podcasts et Deezer.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "La Boîte de Chocolat | Podcast Cinéma Français",
    description:
      "Le podcast cinéma qui te fait aimer le cinoche et la mauvaise foi. +118 épisodes de critiques de films.",
    url: SITE_URL,
  },
};

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
      <LatestEpisodeSection episode={latestEpisode.data || null} />
      <SagaCarousel />
      <BudgetCarousel />
      <EpisodesSection episodes={episodes || []} />
    </main>
  );
}
