import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/podcastHelpers";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import { AGE_RATINGS } from "@/lib/helpers";
import styles from "./PodcastCard.module.css";

interface PodcastCardProps {
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
  isNoResults?: boolean;
  variant?: 'default' | 'compact';
}

export default function PodcastCard({
  film,
  episodeTitle,
  episodeDate,
  episodeDuration,
  episodeSlug,
  isNoResults = false,
  variant = "default",
}: PodcastCardProps) {
  if (isNoResults) {
    return (
      <article className={`${styles.cardArticle} ${styles.noResultsCard}`}>
        <div className={styles.cardImageContainer}>
          <Image
            alt="Navet - Aucun résultat"
            fill
            sizes="(max-width: 768px) 320px, 180px"
            className={styles.cardImage}
            src="/images/navet.png"
            priority={false}
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
  if (!film) return null;

  // Vérifier si le film doit être flouté (âge 18+)
  const shouldBlur = film.age === "18+" || film.age === "adult";

  return (
    <article className={`${styles.cardArticle} ${variant === 'compact' ? styles.cardArticleCompact : ''}`}>
      <Link href={`/podcasts/${episodeSlug}`} className={styles.cardLink}>
        <span className={styles.cardImageContainer}>
          {film.imgFileName ? (
            <>
              <Image
                alt={`Poster de ${film.title}`}
                fill
                sizes={variant === 'compact' ? IMAGE_CONFIG.sizes.filmCardCompact : IMAGE_CONFIG.sizes.filmCard}
                className={`${styles.cardImage} ${shouldBlur ? styles.blurredImage : ''}`}
                src={getVercelBlobUrl(film.imgFileName)}
                priority={false}
                loading="lazy"
                placeholder="blur"
                blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
                quality={IMAGE_CONFIG.defaultQuality}
              />
              {shouldBlur && (
                <div className={styles.ageOverlay}>
                  <span className={styles.ageBadge}>18+</span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noPoster}>
              <span>🎬</span>
            </div>
          )}
          {episodeDuration && (
            <span className={styles.cardDuration}>
              {formatDuration(episodeDuration)}
            </span>
          )}
        </span>
        <div className={styles.cardInformations}>
          <div className={styles.cardTop}>
            <h2 className={styles.cardTitle}>{film.title}</h2>
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
