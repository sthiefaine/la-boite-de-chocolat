"use server";

import { notFound } from "next/navigation";
import Image from "next/image";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import styles from "./PodcastPage.module.css";
import { formatEpisodeDescription, truncateText } from "@/lib/podcastHelpers";
import PodcastCard from "@/components/PodcastCard/PodcastCard";
import SagaCard from "@/components/SagaCard/SagaCard";
import { generateMetadata } from "./metadata";
import {
  getEpisodeNavigation,
  getAllEpisodeSlugs,
  getEpisodeBySlugCached,
} from "@/app/actions/episode";
import { PodcastPlayerButton } from "@/components/PodcastPlayerButton/PodcastPlayerButton";
import { AddToQueueButton } from "@/components/Queue/AddToQueueButton";
import { ShareButton } from "@/components/ShareButton/ShareButton";
import { PodcastJsonLd } from "./json-ld";
import { SITE_URL } from "@/lib/config";
import { Suspense } from "react";
import { getMaskedImageUrl } from "@/app/actions/image";

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export { generateMetadata };

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

  const [episodeResult, finalNavigationResult] = await Promise.all([
    getEpisodeBySlugCached(slug),
    getEpisodeNavigation(slug),
  ]);

  if (!episodeResult) {
    notFound();
  }

  const episode = episodeResult.episode;

  const previousEpisode =
    finalNavigationResult.success &&
    finalNavigationResult.data?.previousEpisode?.links[0]?.film
      ? finalNavigationResult.data.previousEpisode
      : null;
  const nextEpisode =
    finalNavigationResult.success &&
    finalNavigationResult.data?.nextEpisode?.links[0]?.film
      ? finalNavigationResult.data.nextEpisode
      : null;

  const mainFilm = episode.links[0]?.film;
  const saga = mainFilm?.saga || null;
  const isAdultContent = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  const mainFilmImageUrl = isAdultContent
    ? await getMaskedImageUrl(
        mainFilm?.imgFileName || null,
        mainFilm?.age || null
      )
    : mainFilm?.imgFileName
    ? getVercelBlobUrl(mainFilm.imgFileName)
    : "/images/navet.png";

  return (
    <>
      <Suspense fallback={null}>
        <PodcastJsonLd
          episode={{
            title: episode.title,
            description: episode.description,
            pubDate: episode.pubDate,
            updatedAt: episode.updatedAt,
            duration: episode.duration ?? undefined,
            episode: episode.episode ?? undefined,
            season: episode.season ?? undefined,
          }}
          mainFilm={{
            title: mainFilm?.title ?? "",
            director: mainFilm?.director ?? undefined,
            year: mainFilm?.year ?? undefined,
            age: mainFilm?.age ?? undefined,
            imgFileName: mainFilm?.imgFileName ?? undefined,
          }}
          canonicalUrl={`${SITE_URL}/podcast/${episode.slug}`}
        />
      </Suspense>
      <div className={styles.container}>
        {/* Header avec poster en background */}
        <div className={styles.header}>
          {isAdultContent ? (
            <div className={styles.backgroundPoster}>
              <Image
                fill
                src="/images/navet.png"
                alt="Poster navet - contenu 18+"
                className={styles.backgroundImage}
                sizes={IMAGE_CONFIG.sizes.background}
                quality={IMAGE_CONFIG.defaultQuality}
                priority={true}
              />
              <div className={styles.backgroundOverlay}></div>
            </div>
          ) : (
            mainFilm?.imgFileName && (
              <div className={styles.backgroundPoster}>
                <Image
                  fill
                  src={mainFilmImageUrl}
                  alt={`Poster de ${mainFilm.title}`}
                  className={styles.backgroundImage}
                  sizes={IMAGE_CONFIG.sizes.background}
                  quality={100}
                  priority={true}
                />
                <div className={styles.backgroundOverlay}></div>
              </div>
            )
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
                  imageUrl={isAdultContent ? undefined : mainFilmImageUrl}
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
                    img: mainFilmImageUrl,
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

                <ShareButton
                  title={mainFilm?.title || episode.title}
                  url={`${SITE_URL}/episodes/${episode.slug}`}
                  className={`${styles.button} ${styles.shareButton}`}
                />

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
                      priority={false}
                      loading="lazy"
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
                  <span className={styles.navigationLabel}>Épisode suivant</span>
                  <Suspense fallback={null}>
                    {" "}
                    <PodcastCard
                      film={nextEpisode.links[0]?.film}
                      episodeTitle={nextEpisode.title}
                      episodeDate={nextEpisode.pubDate}
                      episodeDuration={nextEpisode.duration}
                      episodeSlug={nextEpisode.slug}
                      variant="compact"
                    />
                  </Suspense>
                </div>
              )}
              {previousEpisode && (
                <div className={styles.navigationCard}>
                  <span className={styles.navigationLabel}>Épisode précédent</span>
                  <Suspense fallback={null}>
                  <PodcastCard
                    film={previousEpisode.links[0]?.film}
                    episodeTitle={previousEpisode.title}
                    episodeDate={previousEpisode.pubDate}
                    episodeDuration={previousEpisode.duration}
                    episodeSlug={previousEpisode.slug}
                    variant="compact"
                    />
                  </Suspense>
                </div>
              )}
              {saga && (
                <div className={styles.navigationCard}>
                  <span className={styles.navigationLabel}>Saga du film</span>
                  <Suspense fallback={null}>
                    <SagaCard saga={saga} variant="compact" />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
