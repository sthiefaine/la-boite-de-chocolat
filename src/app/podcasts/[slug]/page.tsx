import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./PodcastPage.module.css";
import {
  formatEpisodeDescription,
  truncateText,
} from "@/lib/podcastHelpers";
import FilmCard from "@/components/FilmCard/FilmCard";
import { generateMetadata } from "./metadata";
import { getEpisodeBySlug, getEpisodeNavigation } from "@/app/actions/episode";

export { generateMetadata };

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const { getAllEpisodeSlugs } = await import("@/app/actions/episode");
  const result = await getAllEpisodeSlugs();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((episode) => ({
    slug: episode.slug,
  }));
}

export default async function PodcastPage({ params }: PodcastPageProps) {
  const { slug } = await params;

  const episodeResult = await getEpisodeBySlug(slug);

  if (!episodeResult.success || !episodeResult.data) {
    notFound();
  }

  const episode = episodeResult.data;

  const navigationResult = await getEpisodeNavigation(slug, episode.pubDate);

  const previousEpisode = navigationResult.success
    ? navigationResult.data?.previousEpisode
    : null;
  const nextEpisode = navigationResult.success
    ? navigationResult.data?.nextEpisode
    : null;

  const mainFilm = episode.links[0]?.film;

  return (
    <div className={styles.container}>
      {/* Header avec poster en background */}
      <div className={styles.header}>
        {mainFilm?.imgFileName && (
          <div className={styles.backgroundPoster}>
            <Image
              src={`https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`}
              alt={`Poster de ${mainFilm.title}`}
              fill
              className={styles.backgroundImage}
              sizes="100vw"
              priority
            />
            <div className={styles.backgroundOverlay}></div>
          </div>
        )}

        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {mainFilm?.title || episode.title}
              </h1>
              {mainFilm?.year && (
                <span className={styles.year}>({mainFilm.year})</span>
              )}
            </div>

            {mainFilm?.director && (
              <div className={styles.director}>de {mainFilm.director}</div>
            )}

            <div className={styles.buttons}>
              <a
                href={episode.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.listenButton}`}
              >
                <span className={styles.buttonIcon}>🎧</span>
                Écouter
              </a>
              <a
                href={episode.audioUrl}
                download
                className={`${styles.button} ${styles.downloadButton}`}
              >
                <span className={styles.buttonIcon}>⬇️</span>
                Télécharger
              </a>
              {mainFilm?.tmdbId && (
                <a
                  href={`https://www.themoviedb.org/movie/${mainFilm.tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.button} ${styles.tmdbButton}`}
                >
                  <Image
                    src="/images/tmdb_icon.svg"
                    alt="TMDB"
                    width={100}
                    height={30}
                    className={styles.tmdbIcon}
                  />
                </a>
              )}
            </div>

            <div className={styles.publicationDate}>
              Publié le{" "}
              {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {episode.description && (
              <div className={styles.description}>
                <h3 className={styles.descriptionTitle}>Description</h3>
                <div className={styles.descriptionContent}>
                  {truncateText(
                    formatEpisodeDescription(episode.description),
                    650
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation entre épisodes */}
      {(previousEpisode || nextEpisode) && (
        <div className={styles.navigationSection}>
          <div className={styles.navigationContainer}>
            {nextEpisode && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Suivant</span>
                <FilmCard
                  film={nextEpisode.links[0]?.film}
                  episodeTitle={nextEpisode.title}
                  episodeDate={nextEpisode.pubDate}
                  episodeDuration={nextEpisode.duration}
                  episodeSlug={nextEpisode.slug}
                  variant="compact"
                />
              </div>
            )}
            {previousEpisode && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Précédent</span>
                <FilmCard
                  film={previousEpisode.links[0]?.film}
                  episodeTitle={previousEpisode.title}
                  episodeDate={previousEpisode.pubDate}
                  episodeDuration={previousEpisode.duration}
                  episodeSlug={previousEpisode.slug}
                  variant="compact"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
