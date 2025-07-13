"use server";

import { notFound } from "next/navigation";
import Image from "next/image";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import styles from "./PodcastPage.module.css";
import { formatEpisodeDescription, truncateText } from "@/lib/podcastHelpers";
import PodcastCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import SagaCard from "@/components/Cards/SagaCard/SagaCard";
import FilmCard from "@/components/Cards/FilmCard/FilmCard";
import { generateMetadata } from "./metadata";
import {
  getEpisodeNavigation,
  getAllEpisodeSlugs,
  getEpisodeBySlugCached,
} from "@/app/actions/episode";
import { getSagaWithFilmsAndEpisodes } from "@/app/actions/saga";
import { EpisodePlayerButton } from "@/components/Episode/EpisodePlayerButton/EpisodePlayerButton";
import { AddToQueueButton } from "@/components/Queue/AddToQueueButton";
import { ShareButton } from "@/components/ShareButton/ShareButton";
import { PodcastJsonLd } from "./json-ld";
import { SITE_URL } from "@/lib/config";
import { Suspense } from "react";
import ButtonSkeleton from "@/components/Button/ButtonSkeleton";

interface EpisodePageProps {
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

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;

  const [episodeResult, finalNavigationResult] =
    await Promise.all([
      getEpisodeBySlugCached(slug),
      getEpisodeNavigation(slug),
    ]);

  if (!episodeResult) {
    notFound();
  }

  const episode = episodeResult.episode;
  const mainFilm = episode.links[0]?.film;
  const saga = mainFilm?.saga || null;
  const isAdultContent = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  const sagaResult = saga ? await getSagaWithFilmsAndEpisodes(saga.id) : null;

  const previousEpisode = finalNavigationResult.success
    ? finalNavigationResult?.data?.previousEpisode
    : null;
  const nextEpisode = finalNavigationResult.success
    ? finalNavigationResult?.data?.nextEpisode
    : null;

  const mainFilmImageUrl = decodeURIComponent(episodeResult.mainFilmImageUrl);

  return (
    <>
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
      <div className={styles.container}>
        {/* Header avec poster en background */}
        <div className={styles.header}>
          {isAdultContent ? (
            <div className={styles.backgroundPoster}>
              <Image
                fill
                src={mainFilmImageUrl}
                alt="Poster navet - contenu 18+"
                className={styles.backgroundImage}
                sizes={IMAGE_CONFIG.sizes.background}
                quality={IMAGE_CONFIG.defaultQuality}
                priority={true}
                style={{ objectFit: "cover" }}
              />
              <div className={styles.backgroundOverlay}></div>
            </div>
          ) : (
            mainFilm?.imgFileName && (
              <div className={styles.backgroundPoster}>
                <Image
                  fill={true}
                  src={mainFilmImageUrl}
                  alt={`Poster de ${mainFilm.title}`}
                  className={styles.backgroundImage}
                  sizes={IMAGE_CONFIG.sizes.background}
                  quality={100}
                  priority={true}
                  style={{ objectFit: "cover" }}
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
                <Suspense fallback={<ButtonSkeleton />}>
                  <EpisodePlayerButton
                    title={episode.title}
                    audioUrl={episode.audioUrl}
                    imageUrl={isAdultContent ? undefined : mainFilmImageUrl}
                    artist="La Boîte de Chocolat"
                    slug={episode.slug ?? ""}
                    className={`${styles.button} ${styles.listenButton}`}
                  >
                    <span className={styles.buttonIcon}>🎧</span>
                    Écouter
                  </EpisodePlayerButton>
                </Suspense>

                <Suspense fallback={<ButtonSkeleton />}>
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
                </Suspense>

                <a
                  href={episode.audioUrl}
                  download
                  className={`${styles.button} ${styles.downloadButton}`}
                >
                  <span className={styles.buttonIcon}>⬇️</span>
                  Télécharger
                </a>

                <Suspense fallback={<ButtonSkeleton />}>
                  <ShareButton
                    title={mainFilm?.title || episode.title}
                    url={`${SITE_URL}/episodes/${episode.slug}`}
                    className={`${styles.button} ${styles.shareButton}`}
                  />
                </Suspense>
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

        {/* Navigation entre épisodes */}
        {(previousEpisode || nextEpisode) && (
          <div className={styles.navigationSection}>
            <div className={styles.navigationContainer}>
              {nextEpisode && (
                <div className={styles.navigationCard}>
                  <span className={styles.navigationLabel}>
                    Épisode suivant
                  </span>
                  <Suspense fallback={null}>
                    {" "}
                    <PodcastCard
                      film={nextEpisode.links[0]?.film}
                      episodeTitle={nextEpisode.title}
                      episodeDate={nextEpisode.pubDate}
                      episodeDuration={nextEpisode.duration}
                      episodeSlug={nextEpisode.slug}
                      episodeGenre={nextEpisode.genre}
                      variant="compact"
                    />
                  </Suspense>
                </div>
              )}
              {previousEpisode && (
                <div className={styles.navigationCard}>
                  <span className={styles.navigationLabel}>
                    Épisode précédent
                  </span>
                  <Suspense fallback={null}>
                    <PodcastCard
                      film={previousEpisode.links[0]?.film}
                      episodeTitle={previousEpisode.title}
                      episodeDate={previousEpisode.pubDate}
                      episodeDuration={previousEpisode.duration}
                      episodeSlug={previousEpisode.slug}
                      episodeGenre={previousEpisode.genre}
                      variant="compact"
                    />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Saga */}
        {saga && sagaResult && (
          <div className={styles.sagaSection}>
            <div className={styles.sagaContainer}>
              <span className={styles.sagaLabel}>Saga du film</span>
                              <div className={styles.sagaFilmsGrid}>
                  <div className={styles.sagaCardWrapper}>
                    <SagaCard saga={saga} variant="compact" />
                  </div>
                  {sagaResult.saga.films.map((film) => {
                    if (!film) return null;
                    if(!film.year) return null;
                      const episode = sagaResult.filmToEpisodeMap.get(film.id);

                      return (
                        <div key={film.id} className={styles.sagaFilmCard}>
                          <Suspense fallback={null}>
                            <FilmCard
                              film={{
                                id: film.id,
                                title: film.title,
                                slug: film.slug,
                                year: film.year || null,
                                imgFileName: film.imgFileName,
                                age: film.age,
                                director: film.director || null,
                                saga: {
                                  id: saga.id,
                                  name: saga.name,
                                },
                              }}
                              episode={episode}
                              variant="compact"
                            />
                          </Suspense>
                        </div>
                      );
                    })}
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
