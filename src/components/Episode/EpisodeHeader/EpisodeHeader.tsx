"use client";

import Image from "next/image";
import { Suspense } from "react";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import { SITE_URL } from "@/lib/config";
import { truncateText, formatEpisodeDescription } from "@/lib/podcastHelpers";
import { EpisodePlayerButton } from "@/components/Episode/EpisodePlayerButton/EpisodePlayerButton";
import { AddToQueueButton } from "@/components/Queue/AddToQueueButton";
import { ShareButton } from "@/components/ShareButton/ShareButton";
import ButtonSkeleton from "@/components/Button/ButtonSkeleton";
import styles from "./EpisodeHeader.module.css";

interface EpisodeHeaderProps {
  episode: {
    id: string;
    title: string;
    description: string | null;
    audioUrl: string;
    pubDate: Date;
    slug: string | null;
    age: string | null;
    links: Array<{
      film?: {
        title: string;
        year?: number | null;
        director?: string | null;
        imgFileName?: string | null;
        age?: string | null;
        tmdbId?: number | null;
      } | null;
    }>;
  };
  mainFilmImageUrl: string;
  isAdultContent: boolean;
}

export default function EpisodeHeader({
  episode,
  mainFilmImageUrl,
  isAdultContent,
}: EpisodeHeaderProps) {
  const mainFilm = episode.links[0]?.film;

  return (
    <div className={styles.header}>
      {/* Background Poster */}
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
              loading="eager"
            />
            <div className={styles.backgroundOverlay}></div>
          </div>
        )
      )}

      <div className={styles.headerContent}>
        <div className={styles.headerInfo}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{mainFilm?.title || episode.title}</h1>
            {mainFilm?.year && (
              <span className={styles.year}>({mainFilm.year})</span>
            )}
          </div>

          {/* Director */}
          {mainFilm?.director && (
            <div className={styles.director}>de {mainFilm.director}</div>
          )}

          {/* Action Buttons */}
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
                href={`https://www.themoviedb.org/movie/${mainFilm.tmdbId.toString()}`}
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

          {/* Publication Date */}
          <div className={styles.publicationDate}>
            Publié le{" "}
            {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Description */}
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
  );
}
