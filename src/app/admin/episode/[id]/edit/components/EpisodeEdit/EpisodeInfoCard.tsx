"use client";

import { formatDuration } from "@/lib/podcastHelpers";
import styles from "./EpisodeInfoCard.module.css";

interface Film {
  id: string;
  title: string;
  year: number | null;
  director: string | null;
  imgFileName: string | null;
  saga?: {
    name: string;
  } | null;
}

interface EpisodeLink {
  id: string;
  film: Film;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number | null;
  pubDate: Date;
  audioUrl: string;
  slug: string | null;
  season?: number | null;
  episode?: number | null;
  rssFeed: RSSFeed;
  links: EpisodeLink[];
}

interface EpisodeInfoCardProps {
  episode: Episode;
}

export default function EpisodeInfoCard({
  episode,
}: EpisodeInfoCardProps) {
  return (
    <div className={styles.episodeInfoCard}>
      <div className={styles.episodeMainInfo}>
        <div className={styles.podcastInfo}>
          <h3 className={styles.podcastName}>{episode.title}</h3>
          <p className={styles.episodeDate}>
            {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className={styles.episodeDetails}>
          {(episode.season || episode.episode) && (
            <div className={styles.seasonEpisode}>
              {episode.season && (
                <span className={styles.season}>S{episode.season}</span>
              )}
              {episode.episode && (
                <span className={styles.episode}>E{episode.episode}</span>
              )}
            </div>
          )}
          {episode.duration && (
            <div className={styles.duration}>
              {formatDuration(episode.duration)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
