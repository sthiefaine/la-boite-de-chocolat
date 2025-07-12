import EpisodeGrid from "@/components/Episode/EpisodeGrid/EpisodeGrid";
import styles from "./EpisodesWithFilmsSection.module.css";

interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
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
      } | null;
    };
  }>;
}

interface EpisodesWithFilmsSectionProps {
  episodes: Episode[];
}

export default function EpisodesWithFilmsSection({ episodes }: EpisodesWithFilmsSectionProps) {
  return (
    <section className={styles.section} id="episodes">
      <EpisodeGrid episodes={episodes} />
    </section>
  );
}
