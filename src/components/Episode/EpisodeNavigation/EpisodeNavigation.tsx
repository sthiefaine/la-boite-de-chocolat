"use server";

import { Suspense } from "react";
import PodcastCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import styles from "./EpisodeNavigation.module.css";

interface Episode {
  id: string;
  title: string;
  pubDate: Date;
  duration: number | null;
  slug: string | null;
  genre: string | null;
  links: Array<{
    film?: {
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
    } | null;
  }>;
}

interface EpisodeNavigationProps {
  previousEpisode: Episode | null;
  nextEpisode: Episode | null;
}

export default async function EpisodeNavigation({
  previousEpisode,
  nextEpisode,
}: EpisodeNavigationProps) {
  if (!previousEpisode && !nextEpisode) {
    return null;
  }

  return (
    <div className={styles.navigationSection}>
      <div className={styles.navigationContainer}>
        {nextEpisode && (
          <div className={styles.navigationCard}>
            <span className={styles.navigationLabel}>Épisode suivant</span>
            <Suspense fallback={null}>
              <PodcastCard
                film={nextEpisode.links[0]?.film || undefined}
                episodeTitle={nextEpisode.title}
                episodeDate={nextEpisode.pubDate}
                episodeDuration={nextEpisode.duration}
                episodeSlug={nextEpisode.slug}
                episodeGenre={nextEpisode.genre}
                variant="compact"
                imageConfig={{
                  quality: 80,
                  lazy: true,
                  priority: false,
                }}
              />
            </Suspense>
          </div>
        )}
        {previousEpisode && (
          <div className={styles.navigationCard}>
            <span className={styles.navigationLabel}>Épisode précédent</span>
            <Suspense fallback={null}>
              <PodcastCard
                film={previousEpisode.links[0]?.film || undefined}
                episodeTitle={previousEpisode.title}
                episodeDate={previousEpisode.pubDate}
                episodeDuration={previousEpisode.duration}
                episodeSlug={previousEpisode.slug}
                episodeGenre={previousEpisode.genre}
                variant="compact"
                imageConfig={{
                  lazy: true,
                  priority: false,
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
