"use client";

import Image from "next/image";
import { IMAGE_CONFIG } from "@/lib/imageConfig";
import styles from "./SagaCard.module.css";

const getStaticImageUrl = (imgFileName: string) => {
  return `https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/sagas/${imgFileName}`;
};

interface SagaCardProps {
  saga: {
    id: string;
    name: string;
    description?: string | null;
    imgFileName?: string | null;
    films: Array<{
      id: string;
      title: string;
      year?: number | null;
      slug: string;
    }>;
  };
  variant?: "default" | "compact";
}

export default function SagaCard({ saga, variant = "default" }: SagaCardProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`${styles.sagaCard} ${isCompact ? styles.compact : ""}`}>
      <div className={styles.sagaImage}>
        {saga.imgFileName ? (
          <Image
            src={getStaticImageUrl(saga.imgFileName)}
            alt={`Poster de la saga ${saga.name}`}
            fill
            className={styles.image}
            sizes={isCompact ? "200px" : "300px"}
            quality={IMAGE_CONFIG.defaultQuality}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderText}>🎬</span>
          </div>
        )}
      </div>

      <div className={styles.sagaInfo}>
        <h3 className={styles.sagaTitle}>{saga.name}</h3>

        {!isCompact && saga.description && (
          <p className={styles.sagaDescription}>
            {saga.description.length > 120
              ? `${saga.description.substring(0, 120)}...`
              : saga.description}
          </p>
        )}

        <div className={styles.filmsCount}>
          {saga.films.length} film{saga.films.length > 1 ? "s" : ""}
        </div>

        {!isCompact && saga.films.length > 0 && (
          <div className={styles.filmsList}>
            {saga.films.slice(0, 3).map((film) => (
              <span key={film.id} className={styles.filmItem}>
                {film.title}
                {film.year && ` (${film.year})`}
              </span>
            ))}
            {saga.films.length > 3 && (
              <span className={styles.moreFilms}>
                +{saga.films.length - 3} autres
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
