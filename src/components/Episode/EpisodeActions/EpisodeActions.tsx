import Image from "next/image";
import { Suspense } from "react";
import { EpisodePlayerButton } from "@/components/Episode/EpisodePlayerButton/EpisodePlayerButton";
import { AddToQueueButton } from "@/components/Queue/AddToQueueButton";
import { ShareButton } from "@/components/ShareButton/ShareButton";
import ButtonSkeleton from "@/components/Button/ButtonSkeleton";
import { SITE_URL } from "@/lib/config";
import styles from "./EpisodeActions.module.css";

interface EpisodeActionsProps {
  episode: {
    id: string;
    title: string;
    audioUrl: string;
    slug: string | null;
    age?: string | null;
    links: Array<{
      film?: {
        title: string;
        age?: string | null;
        tmdbId?: number | null;
      } | null;
    }>;
  };
  mainFilmImageUrl: string;
  isAdultContent: boolean;
}

export default function EpisodeActions({
  episode,
  mainFilmImageUrl,
  isAdultContent,
}: EpisodeActionsProps) {
  const mainFilm = episode.links[0]?.film;
  return (
    <div className={styles.buttons}>
      <Suspense fallback={<ButtonSkeleton />}>
        <EpisodePlayerButton
          title={episode.title}
          audioUrl={episode.audioUrl}
          imageUrl={isAdultContent ? undefined : mainFilmImageUrl}
          artist="La Boîte de Chocolat"
          slug={episode.slug ?? ""}
          className={`${styles.button} ${styles.listenButton}`}
        >
          <span className={styles.buttonIcon}>🎧</span>
          Écouter
        </EpisodePlayerButton>
      </Suspense>

      <Suspense fallback={<ButtonSkeleton />}>
        <AddToQueueButton
          podcast={{
            id: episode.id,
            title: episode.title,
            artist: "La Boîte de Chocolat",
            url: episode.audioUrl,
            img: mainFilmImageUrl,
            slug: episode.slug ?? "",
            age: episode.age ?? "",
            movieAge: mainFilm?.age ?? "",
          }}
          className={`${styles.button} ${styles.queueButton}`}
        />
      </Suspense>

      <a
        href={episode.audioUrl}
        download
        className={`${styles.button} ${styles.downloadButton}`}
      >
        <span className={styles.buttonIcon}>⬇️</span>
        Télécharger
      </a>

      <Suspense fallback={<ButtonSkeleton />}>
        <ShareButton
          title={mainFilm?.title || episode.title}
          url={`${SITE_URL}/episodes/${episode.slug}`}
          className={`${styles.button} ${styles.shareButton}`}
        />
      </Suspense>

      {mainFilm?.tmdbId && (
        <a
          href={`https://www.themoviedb.org/movie/${mainFilm.tmdbId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.tmdbButton}`}
        >
          <Image
            src="/images/tmdb_icon.svg"
            alt="TMDB"
            width={100}
            height={30}
            className={styles.tmdbIcon}
            priority={false}
            loading="lazy"
          />
        </a>
      )}
    </div>
  );
} 