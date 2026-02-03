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
            sizes={variant === "carousel" ? "200px" : "(max-width: 768px) 50vw, 250px"}
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback}>🎬</div>
        )}
        <div className={styles.imageOverlay} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{saga.name}</h3>
        <div className={styles.stats}>
          <span className={styles.stat}>{saga.films.length} film{saga.films.length > 1 ? "s" : ""}</span>
          <span className={styles.statDot}>·</span>
          <span className={styles.stat}>{saga.episodeCount} épisode{saga.episodeCount > 1 ? "s" : ""}</span>
        </div>

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
