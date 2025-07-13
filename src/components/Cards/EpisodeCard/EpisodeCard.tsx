import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/podcastHelpers";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import styles from "./EpisodeCard.module.css";

interface ImageConfig {
  quality?: number;
  lazy?: boolean;
  priority?: boolean;
}

interface EpisodeCardProps {
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
  };
  episodeTitle?: string;
  episodeDate?: Date;
  episodeDuration?: number | null;
  episodeSlug?: string | null;
  episodeGenre?: string | null;
  isNoResults?: boolean;
  variant?: "default" | "compact";
  imageConfig?: ImageConfig;
}

const getStaticImageUrl = (imgFileName: string, age: string | null): string => {
  const isAdult = age === "18+" || age === "adult";
  return isAdult
    ? `/api/image/masked/${imgFileName}`
    : `https://${IMAGE_CONFIG.domains.vercelBlob}/films/${imgFileName}`;
};

export default function EpisodeCard({
  film,
  episodeTitle,
  episodeDate,
  episodeDuration,
  episodeSlug,
  episodeGenre,
  isNoResults = false,
  variant = "default",
  imageConfig = {
    quality: IMAGE_CONFIG.defaultQuality,
    lazy: true,
    priority: false,
  },
}: EpisodeCardProps) {

  const displayTitle = film ? film.title : episodeTitle || "Épisode sans titre";
  const displayImage = film?.imgFileName || null;
  const displayAge = film?.age || null;
  const shouldBlur = displayAge === "18+" || displayAge === "adult";

  if (isNoResults) {
    return (
      <article className={`${styles.cardArticle} ${styles.noResultsCard}`}>
        <div className={styles.cardImageContainer}>
          <Image
            alt="Navet - Aucun résultat"
            fill
            sizes="200px"
            className={styles.cardImage}
            src="/images/navet.png"
            priority={false}
            quality={IMAGE_CONFIG.defaultQuality}
          />
        </div>
        <div className={styles.cardInformations}>
          <div className={styles.cardTop}>
            <h2 className={styles.cardTitle}>Aucun résultat trouvé</h2>
          </div>
          <span className={styles.episodeDate}>
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${styles.cardArticle} ${
        variant === "compact" ? styles.cardArticleCompact : ""
      }`}
    >
      <Link
        href={`/episodes/${episodeSlug}`}
        className={styles.cardLink}
        prefetch={true}
      >
        <div className={styles.cardImageContainer}>
          {displayImage ? (
            <>
              <Image
                alt={`Poster de ${displayTitle}`}
                fill
                sizes="200px"
                className={`${styles.cardImage} ${
                  shouldBlur ? styles.blurredImage : ""
                }`}
                src={getStaticImageUrl(displayImage, displayAge)}
                priority={imageConfig.priority}
                loading={imageConfig.lazy ? "lazy" : "eager"}
                quality={imageConfig.quality}
              />
              {shouldBlur && (
                <div className={styles.ageOverlay}>
                  <span className={styles.ageBadge}>+18</span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noPoster}>
              <span>🎬</span>
            </div>
          )}
          {!film && episodeGenre && (
            <div className={styles.genreOverlay}>
              <span className={styles.genreBadge}>{episodeGenre}</span>
            </div>
          )}
          {episodeDuration && (
            <span className={styles.cardDuration}>
              {formatDuration(episodeDuration)}
            </span>
          )}
        </div>
        <div className={styles.cardInformations}>
          <div className={styles.cardTop}>
            <h2 className={styles.cardTitle}>{displayTitle}</h2>
            <span className={styles.cardOptions}></span>
          </div>
          <div className={styles.cardBottom}>
            {episodeDate && (
              <span className={styles.episodeDate}>
                {new Date(episodeDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
