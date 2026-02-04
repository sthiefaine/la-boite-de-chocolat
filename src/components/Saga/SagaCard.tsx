import Image from "next/image";
import Link from "next/link";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import styles from "./SagaCard.module.css";

interface SagaCardProps {
  saga: {
    id: string;
    name: string;
    slug: string;
    imgFileName?: string | null;
    films: Array<{
      id: string;
      title: string;
      year?: number | null;
      imgFileName?: string | null;
    }>;
    episodeCount: number;
  };
  variant?: "carousel" | "grid";
}

export default function SagaCard({ saga, variant = "carousel" }: SagaCardProps) {
  const imageUrl = saga.imgFileName
    ? getUploadServerUrl(saga.imgFileName, "sagas")
    : saga.films[0]?.imgFileName
    ? getUploadServerUrl(saga.films[0].imgFileName, "films")
    : null;

  // Calculer la plage d'années pour la timeline simplifiée
  const filmsWithYears = [...saga.films]
    .filter((f) => f.year !== null && f.year !== undefined)
    .sort((a, b) => (a.year || 0) - (b.year || 0));

  const yearRange = filmsWithYears.length > 1 ? {
    firstYear: filmsWithYears[0].year,
    lastYear: filmsWithYears[filmsWithYears.length - 1].year,
  } : null;

  return (
    <Link
      href={`/sagas/${saga.slug}`}
      className={`${styles.card} ${variant === "grid" ? styles.cardGrid : styles.cardCarousel}`}
    >
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={saga.name}
            fill
            sizes={variant === "carousel" ? "140px" : "(max-width: 768px) 50vw, 250px"}
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback}>🎬</div>
        )}
        <div className={styles.imageOverlay} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{saga.name}</h3>
        <div className={styles.statsCompact}>
          <div className={styles.statBadge}>
            <span className={styles.statIcon}>🎬</span>
            <span>{saga.films.length}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statIcon}>📺</span>
            <span>{saga.episodeCount}</span>
          </div>
        </div>

        {variant === "carousel" && yearRange && (
          <div className={styles.yearRange}>
            <span className={styles.yearStart}>{yearRange.firstYear}</span>
            <div className={styles.yearConnector} />
            <span className={styles.yearEnd}>{yearRange.lastYear}</span>
          </div>
        )}

        {variant === "grid" && saga.films.length > 0 && (
          <div className={styles.filmList}>
            {saga.films.slice(0, 5).map((film) => (
              <span key={film.id} className={styles.filmTag}>
                {film.title} {film.year ? `(${film.year})` : ""}
              </span>
            ))}
            {saga.films.length > 5 && (
              <span className={styles.filmTagMore}>+{saga.films.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
