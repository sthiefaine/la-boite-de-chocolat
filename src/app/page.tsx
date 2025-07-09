import styles from "./Home.module.css";
import HeroSection from "../components/sections/HeroSection/HeroSection";
import LatestEpisodeSection from "../components/sections/LatestEpisodeSection/LatestEpisodeSection";
import EpisodesWithFilmsSection from "../components/sections/EpisodesWithFilmsSection";

export default function Home() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <LatestEpisodeSection />
      <EpisodesWithFilmsSection />
    </main>
  );
}