import Image from "next/image";
import Link from "next/link";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import styles from "./FilmCard.module.css";

interface EpisodeData {
  id: string;
  title: string;
  slug: string | null;
  duration?: number | null;
  pubDate: Date;
}

interface ImageConfig {
  quality: number;
  lazy: boolean;
  priority: boolean;
}

interface FilmCardProps {
  film: {
    id: string;
    title: string;
    slug: string;
    year: number | null;
    imgFileName: string | null;
    age: string | null;
    director?: string | null;
    saga?: {
      name: string;
      id: string;
    } | null;
  };
  variant?: "default" | "compact";
  episode?: EpisodeData;
  imageConfig?: ImageConfig;
}

const getStaticImageUrl = (imgFileName: string, age: string | null): string => {
  const isAdult = age === "18+" || age === "adult";
  return isAdult
    ? `/api/image/masked/${imgFileName}`
    : `https://${IMAGE_CONFIG.domains.vercelBlob}/films/${imgFileName}`;
};

const isAdultContent = (age: string | null): boolean => {
  return age === "18+" || age === "adult";
};

export default function FilmCard({
  film,
  variant = "default",
  episode,
  imageConfig = {
    quality: IMAGE_CONFIG.defaultQuality,
    lazy: true,
    priority: false,
  },
}: FilmCardProps) {
  const { title, imgFileName, age, year, director } = film;
  const shouldBlur = isAdultContent(age);
  const isDisabled = !episode;

  return (
    <article
      className={`${styles.filmCard} ${
        variant === "compact" ? styles.filmCardCompact : ""
      } ${isDisabled ? styles.filmCardDisabled : ""}`}
    >
      <div className={styles.filmContent}>
        <span className={styles.filmImageContainer}>
          {imgFileName ? (
            <>
              <Image
                alt={`Poster de ${title}`}
                fill
                sizes={
                  variant === "compact"
                    ? IMAGE_CONFIG.sizes.filmCardCompact
                    : IMAGE_CONFIG.sizes.filmCard
                }
                className={`${styles.filmImage} ${
                  shouldBlur ? styles.blurredImage : ""
                } ${isDisabled ? styles.disabledImage : ""}`}
                src={getStaticImageUrl(imgFileName, age)}
                priority={imageConfig.priority}
                loading={imageConfig.lazy ? "lazy" : "eager"}
                quality={imageConfig.quality}
              />

              {shouldBlur && (
                <div className={styles.ageOverlay}>
                  <span className={styles.ageBadge}>+18</span>
                </div>
              )}

              {episode && (
                <div className={styles.listenButtonOverlay}>
                  <Link
                    href={`/episodes/${episode.slug}`}
                    className={styles.listenButtonOverlay}
                    prefetch={true}
                  >
                    <span className={styles.buttonIcon}>🎬</span>
                    Afficher
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noPoster}>
              <span>🎬</span>
            </div>
          )}

          {age && !isAdultContent(age) && (
            <div className={styles.ageOverlay}>
              <span className={styles.ageBadge}>{age}</span>
            </div>
          )}
        </span>

        <div className={styles.filmInformations}>
          <div className={styles.filmTop}>
            <h2 className={styles.filmTitle}>{title}</h2>
            <span className={styles.filmOptions}></span>
          </div>
          <div className={styles.filmBottom}>
            {year && <span className={styles.filmYear}>{year}</span>}
            {director && (
              <span className={styles.filmDirector}>de {director}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
