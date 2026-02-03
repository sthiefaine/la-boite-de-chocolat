import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/helpers/podcastHelpers";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";
import FavoriteButton from "@/components/Favorite/FavoriteButton";
import ListenedButton from "@/components/Listened/ListenedButton";
import styles from "./EpisodeCard.module.css";

interface ImageConfig {
  quality?: number;
  lazy?: boolean;
  priority?: boolean;
}

interface EpisodeCardProps {
  episodeId?: string;
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
  effect?: "none" | "prism" | "holo" | "glow";
}

const getStaticImageUrl = (imgFileName: string, age: string | null): string => {
  const isAdult = age === "18+" || age === "adult";
  return isAdult
    ? `/api/image/masked/${imgFileName}`
    : `${IMAGE_CONFIG.domains.uploadReadServer}/films/${imgFileName}`;
};

export default function EpisodeCard({
  episodeId,
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
  effect = "none",
}: EpisodeCardProps) {

  const displayTitle = film ? film.title : episodeTitle || "Épisode sans titre";
  const displayImage = film?.imgFileName || null;
  const displayAge = film?.age || null;
  const shouldBlur = displayAge === "18+" || displayAge === "adult";

  // Alt text enrichi pour le SEO
  const altText = shouldBlur
    ? "Poster flouté - contenu 18+"
    : film?.year
      ? `Poster du film ${displayTitle} (${film.year})`
      : `Poster de ${displayTitle}`;

  const effectClass = effect !== "none" ? styles[`effect${effect}`] : "";

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
        scroll={true}
      >
        <div className={`${styles.cardImageContainer} ${effectClass}`}>
          {displayImage ? (
            <>
              <Image
                alt={altText}
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
          {episodeDate &&
            Date.now() - new Date(episodeDate).getTime() <
              7 * 24 * 60 * 60 * 1000 && (
              <span className={styles.newBadge}>Nouveau</span>
            )}
          {episodeDuration && (
            <span className={styles.cardDuration}>
              {formatDuration(episodeDuration)}
            </span>
          )}
          {episodeId && (
            <>
              <FavoriteButton episodeId={episodeId} variant="overlay" />
              <ListenedButton episodeId={episodeId} variant="overlay" />
            </>
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
