import { notFound } from "next/navigation";
import Image from "next/image";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import styles from "./PodcastPage.module.css";
import { formatEpisodeDescription, truncateText } from "@/lib/podcastHelpers";
import PodcastCard from "@/components/PodcastCard/PodcastCard";
import SagaCard from "@/components/SagaCard/SagaCard";
import { generateMetadata } from "./metadata";
import {
  getEpisodeBySlug,
  getEpisodeNavigation,
  getAllEpisodeSlugs,
} from "@/app/actions/episode";
import { PodcastPlayerButton } from "@/components/PodcastPlayerButton/PodcastPlayerButton";
import { AddToQueueButton } from "@/components/Queue/AddToQueueButton";

export { generateMetadata };

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
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

  const previousEpisode =
    navigationResult.success &&
    navigationResult.data?.previousEpisode?.links[0]?.film
      ? navigationResult.data.previousEpisode
      : null;
  const nextEpisode =
    navigationResult.success &&
    navigationResult.data?.nextEpisode?.links[0]?.film
      ? navigationResult.data.nextEpisode
      : null;

  const mainFilm = episode.links[0]?.film;
  const saga = mainFilm?.saga || null;

  return (
    <div className={styles.container}>
      {/* Header avec poster en background */}
      <div className={styles.header}>
        {(mainFilm?.age === "18+" || mainFilm?.age === "adult") ? (
          <div className={styles.backgroundPoster}>
            <Image
              fill
              src="/images/navet.png"
              alt="Poster navet - contenu 18+"
              className={styles.backgroundImage}
              sizes={IMAGE_CONFIG.sizes.background}
              priority
            />
            <div className={styles.backgroundOverlay}></div>
          </div>
        ) : mainFilm?.imgFileName && (
          <div className={styles.backgroundPoster}>
            <Image
              fill
              src={getVercelBlobUrl(mainFilm.imgFileName)}
              alt={`Poster de ${mainFilm.title}`}
              className={styles.backgroundImage}
              sizes={IMAGE_CONFIG.sizes.background}
              priority
              placeholder="blur"
              blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
              quality={IMAGE_CONFIG.defaultQuality}
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
              <PodcastPlayerButton
                title={episode.title}
                audioUrl={episode.audioUrl}
                imageUrl={
                  mainFilm?.imgFileName
                    ? getVercelBlobUrl(mainFilm.imgFileName)
                    : undefined
                }
                artist="La Boîte de Chocolat"
                slug={episode.slug ?? ""}
                className={`${styles.button} ${styles.listenButton}`}
              >
                <span className={styles.buttonIcon}>🎧</span>
                Écouter
              </PodcastPlayerButton>

              <AddToQueueButton
                podcast={{
                  id: episode.id,
                  title: episode.title,
                  artist: "La Boîte de Chocolat",
                  url: episode.audioUrl,
                  img: mainFilm?.imgFileName
                    ? getVercelBlobUrl(mainFilm.imgFileName)
                    : "/images/navet.png",
                  slug: episode.slug ?? "",
                  age: episode.age ?? "",
                  movieAge: mainFilm?.age ?? "",
                }}
                className={`${styles.button} ${styles.queueButton}`}
              />

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
                <div className={`${styles.descriptionContent} glass`}>
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

      {/* Navigation entre épisodes et saga */}
      {(previousEpisode || nextEpisode || saga) && (
        <div className={styles.navigationSection}>
          <div className={styles.navigationContainer}>
            {nextEpisode && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Suivant</span>
                <PodcastCard
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
                <PodcastCard
                  film={previousEpisode.links[0]?.film}
                  episodeTitle={previousEpisode.title}
                  episodeDate={previousEpisode.pubDate}
                  episodeDuration={previousEpisode.duration}
                  episodeSlug={previousEpisode.slug}
                  variant="compact"
                />
              </div>
            )}
            {saga && (
              <div className={styles.navigationCard}>
                <span className={styles.navigationLabel}>Saga</span>
                <SagaCard saga={saga} variant="compact" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
