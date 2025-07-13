"use client";

import Image from "next/image";
import Link from "next/link";
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
    <article className={`${styles.cardSaga} ${isCompact ? styles.cardSagaCompact : ""}`}>
      <>
        <span className={styles.cardImageContainer}>
          {saga.imgFileName ? (
            <Image
              src={getStaticImageUrl(saga.imgFileName)}
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
            <span className={styles.episodeDate}>
              {saga.films.length} film{saga.films.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </>
    </article>
  );
}
