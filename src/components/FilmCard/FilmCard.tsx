import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/podcastHelpers";
import styles from "./FilmCard.module.css";

interface FilmCardProps {
  film: {
    id: string;
    title: string;
    slug: string;
    year: number | null;
    imgFileName: string | null;
    saga: {
      name: string;
      id: string;
    } | null;
  };
  episodeTitle?: string;
  episodeDate?: Date;
  episodeDuration?: number | null;
  episodeSlug?: string | null;
}

export default function FilmCard({
  film,
  episodeTitle,
  episodeDate,
  episodeDuration,
  episodeSlug,
}: FilmCardProps) {
  return (
    <article className={styles.cardArticle}>
      <Link
        href={`/podcasts/${episodeSlug}`}
        className={styles.cardLink}
      >
        <span className={styles.cardImageContainer}>
          {film.imgFileName ? (
            <Image
              alt={`Poster de ${film.title}`}
              fill
              sizes="(max-width: 768px) 320px, 180px"
              className={styles.cardImage}
              src={`https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${film.imgFileName}`}
              priority={false}
            />
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
