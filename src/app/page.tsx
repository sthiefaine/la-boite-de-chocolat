"use server";

import styles from "./Home.module.css";
import HeroSection from "../components/Sections/HeroSection/HeroSection";
import LatestEpisodeSection from "../components/Sections/LatestEpisodeSection/LatestEpisodeSection";
import EpisodesWithFilmsSection from "../components/Sections/EpisodesWithFilmsSection/EpisodesWithFilmsSection";
import { getEpisodesWithFilms } from "./actions/episode";

export default async function Home() {
  const episodesResult = await getEpisodesWithFilms();
  const episodes = episodesResult.success ? episodesResult.data : [];
  return (
      <main className={styles.main}>
        <HeroSection episodes={episodes || []} />
        <LatestEpisodeSection />
        <EpisodesWithFilmsSection episodes={episodes || []} />
      </main>
  );
}