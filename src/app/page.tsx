"use server";
import styles from "./Home.module.css";
import { getEpisodesWithFilms } from "./actions/episode";

import LatestEpisodeSection from "@/components/Sections/LatestEpisodeSection/LatestEpisodeSection";
import HeroSection from "@/components/Sections/HeroSection/HeroSection";
import EpisodesSection from "@/components/Sections/EpisodesSection/EpisodesSection";

export default async function Home() {
  const episodesResult = await getEpisodesWithFilms();
  const episodes = episodesResult.success ? episodesResult.data : [];
  return (
    <main className={styles.main}>
      <HeroSection episodes={episodes || []} />
      <LatestEpisodeSection />
      <EpisodesSection episodes={episodes || []} />
    </main>
  );
}
