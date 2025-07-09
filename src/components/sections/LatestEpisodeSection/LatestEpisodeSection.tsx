import Link from "next/link";
import { getLatestEpisode } from "@/app/actions/episode";
import { formatEpisodeDescription, formatDuration } from "@/lib/podcastHelpers";
import styles from "./LatestEpisodeSection.module.css";

export default async function LatestEpisodeSection() {
  const result = await getLatestEpisode();

  if (!result.success || !result.data) {
    return (
      <section className={styles.latestEpisode} id="latest-episode">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Dernier épisode</h2>
            <Link href="#episodes" className={styles.allEpisodesLink}>
              Tous les épisodes
              <span className={styles.arrow}>→</span>
            </Link>
          </div>

          <div className={styles.episodeCard}>
            <div className={styles.episodeInfo}>
              <h3 className={styles.episodeTitle}>Aucun épisode disponible</h3>

              <p className={styles.episodeDescription}>
                Aucun épisode n'a été importé pour le moment.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const episode = result.data;
  const episodeNumber = episode.title.match(/#(\d+)/)?.[1] || "";
  const filmsCount = episode.links.length;

  return (
    <section className={styles.latestEpisode} id="latest-episode">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Dernier épisode</h2>
          <Link href="#episodes" className={styles.allEpisodesLink}>
            Tous les épisodes
            <span className={styles.arrow}>→</span>
          </Link>
        </div>

        <div className={styles.episodeCard}>
          <div className={styles.episodeInfo}>
            <h3 className={styles.episodeTitle}>{episode.title}</h3>

            <p className={styles.episodeDescription}>
              {formatEpisodeDescription(episode.description, 200)}
            </p>

            <div className={styles.episodeMeta}>
              <span className={styles.episodeDate}>
                {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {episode.duration && (
                <span className={styles.episodeDuration}>
                  {formatDuration(episode.duration)}
                </span>
              )}
            </div>
          </div>

          <div className={styles.playerSection}>
            <a
              href={episode.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.spotifyButton}
            >
              <span className={styles.spotifyIcon}>🎵</span>
              Écouter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
