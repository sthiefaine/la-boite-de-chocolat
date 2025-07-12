import EpisodeGrid from "@/components/Episode/EpisodeGrid/EpisodeGrid";
import styles from "./EpisodesSection.module.css";

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

interface EpisodesSectionProps {
  episodes: Episode[];
}

export default function EpisodesSection({ episodes }: EpisodesSectionProps) {
  return (
    <section className={styles.section} id="episodes">
      <EpisodeGrid episodes={episodes} />
    </section>
  );
}
