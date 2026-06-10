"use client";

import Image from "next/image";
import Link from "next/link";
import { IMAGE_CONFIG, getSagaPosterUrl } from "@/helpers/imageConfig";
import styles from "./SagaCard.module.css";

interface SagaCardProps {
  saga: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imgFileName?: string | null;
    tmdbId?: number | null;
    episodeCount?: number;
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
    <Link href={`/sagas/${saga.slug}`} className={styles.cardLink}>
      <article className={`${styles.cardSaga} ${isCompact ? styles.cardSagaCompact : ""}`}>
        <span className={styles.cardImageContainer}>
          {saga.imgFileName || saga.tmdbId ? (
            <Image
              src={getSagaPosterUrl({ tmdbId: saga.tmdbId, imgFileName: saga.imgFileName })}
              alt={`Poster de la saga ${saga.name}`}
              fill
              className={styles.cardImage}
              sizes={isCompact ? "200px" : "300px"}
              quality={IMAGE_CONFIG.defaultQuality}
            />
          ) : (
            <div className={styles.noPoster}>
              <span>🎬</span>
            </div>
          )}
        </span>
        <div className={styles.cardInformations}>
          <div className={styles.cardTop}>
            <h2 className={styles.cardTitle}>{saga.name}</h2>
            <span className={styles.cardOptions}></span>
          </div>
          <div className={styles.cardBottom}>
            <div className={styles.cardStats}>
              <span className={styles.statItem}>
                🎬 {saga.films.length} film{saga.films.length > 1 ? "s" : ""}
              </span>
              {saga.episodeCount !== undefined && (
                <span className={styles.statItem}>
                  🎧 {saga.episodeCount} épisode{saga.episodeCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
