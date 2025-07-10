import Link from "next/link";
import Image from "next/image";
import { getLatestEpisode } from "@/app/actions/episode";
import {
  formatEpisodeDescription,
  formatDuration,
  truncateToLines,
} from "@/lib/podcastHelpers";
import { PodcastPlayerButton } from "@/components/PodcastPlayerButton/PodcastPlayerButton";
import styles from "./LatestEpisodeSection.module.css";

export default async function LatestEpisodeSection() {
  const result = await getLatestEpisode();

  if (!result.success || !result.data) {
    return (
      <section className={styles.latestEpisode} id="latest-episode">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>🎙️ Dernier épisode</h2>
          </div>

          <div className={styles.episodeCard}>
            <div className={styles.episodeInfo}>
              <div className={styles.episodeBadge}>
                <span className={styles.badgeText}>Nouveau</span>
              </div>
              <h3 className={styles.episodeTitle}>Aucun épisode disponible</h3>
              <p className={styles.episodeDescription}>
                Revenez bientôt pour découvrir notre dernier épisode !
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const episode = result.data;
  const mainFilm = episode.links[0]?.film;

  const seasonEpisode =
    episode.season && episode.episode
      ? `S${episode.season.toString().padStart(2, "0")}E${episode.episode
          .toString()
          .padStart(2, "0")}`
      : null;

  return (
    <section className={styles.latestEpisode} id="latest-episode">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎙️ Dernier épisode</h2>
        </div>

        <div className={styles.episodeCard}>
          <div className={styles.episodeInfo}>
            <div className={styles.episodeBadge}>
              <span className={styles.badgeText}>Nouveau</span>
            </div>

            <h3 className={styles.episodeTitle}>{episode.title}</h3>

            <p className={styles.episodeDescription}>
              {truncateToLines(
                formatEpisodeDescription(episode.description),
                3
              )}
            </p>

            <div className={styles.episodeMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span>
                <span className={styles.episodeDate}>
                  {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {episode.duration && (
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏱️</span>
                  <span className={styles.episodeDuration}>
                    {formatDuration(episode.duration)}
                  </span>
                </div>
              )}

              {seasonEpisode && (
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📺</span>
                  <span className={styles.seasonEpisode}>{seasonEpisode}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.mediaSection}>
            {mainFilm?.imgFileName && (
              <div className={styles.filmPoster}>
                <Image
                  src={`https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`}
                  alt={`Poster de ${mainFilm.title}`}
                  width={120}
                  height={180}
                  className={styles.posterImage}
                  priority
                />
                <div className={styles.filmInfo}>
                  <h4 className={styles.filmTitle}>{mainFilm.title}</h4>
                  {mainFilm.year && (
                    <span className={styles.filmYear}>({mainFilm.year})</span>
                  )}
                </div>
              </div>
            )}

            <div className={styles.playerSection}>
              <PodcastPlayerButton
                title={episode.title}
                audioUrl={episode.audioUrl}
                imageUrl={
                  mainFilm?.imgFileName
                    ? `https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`
                    : undefined
                }
                artist="La Boîte de Chocolat"
                slug={episode.slug ?? ""}
                className={styles.playButton}
              >
              </PodcastPlayerButton>

              {episode.slug && (
                <Link
                  href={`/podcasts/${episode.slug}`}
                  className={styles.visitButton}
                >
                  <span className={styles.visitIcon}>👁️</span>
                  <span className={styles.visitText}>Visiter la page</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
